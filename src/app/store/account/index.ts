import { Injectable, NgZone } from '@angular/core';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { Models, Permission, Role } from 'appwrite';
import { Appwrite } from 'src/app/helpers/appwrite';
import { GlobalActions } from '../global';
import { Path } from '../../helpers/path';
import { Account as AccountModel } from '../../model/account';
import { Observable } from 'rxjs';
import { Picture } from '../../helpers/picture';
import { ModalController, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Location } from '../location';
import { environment } from '../../../environments/environment';
import { BackendUnderMaintenanceComponent } from '../../component/backend-under-maintenance/backend-under-maintenance.component';

/* State Model */
@Injectable()
export class AccountStateModel {
  user: AccountModel.User;
  session: Models.Session;
}

export namespace Account {
  /** Actions */
  export class Signup {
    static readonly type = '[Auth] Signup';

    constructor(
      public payload: { email: string; password: string; name: string; profilePicture: string }
    ) {
    }
  }

  export class Fetch {
    static readonly type = '[Auth] Fetch';
  }

  export class Update {
    static readonly type = '[User] Update';

    constructor(
      public payload: { prefs?: AccountModel.UserPrefs; name?: string; profilePicture?: string }
    ) {
    }
  }

  export class Login {
    static readonly type = '[Auth] Login';

    constructor(public payload: { email: string; password: string }) {
    }
  }

  export class SendResetEmail {
    static readonly type = '[Auth] Reset Password Email';

    constructor(public payload: string) {
    }
  }

  export class ResetBackendUnderMaintenance {
    static readonly type = '[Auth] Reset Backend Under Maintenance';

    constructor() {
    }
  }

  export class ResetPassword {
    static readonly type = '[Auth] Reset Password';

    constructor(public payload: { userId: string; secret: string; password: string; confirmPassword: string }) {
    }
  }

  export class ResetPasswordExpired {
    static readonly type = '[Auth] Reset Password expired';
  }

  export class Logout {
    static readonly type = '[Auth] Logout';
  }

  /** Events */
  export class Redirect {
    static readonly type = '[Auth] AccountRedirect';

    constructor(public payload: { path: string; forward: boolean; navigateRoot: boolean }) {
    }
  }
}

const prefs = {
  description: '',
  distance: 'close',
  accounts: {
    instagram: ''
  }
};

@State<AccountStateModel>({
  name: 'auth',
  defaults: {
    user: {
      prefs
    } as unknown as AccountModel.User,
    session: null,
  },
})

@Injectable()
export class AccountState {
  backendUnderMaintenanceModal: HTMLIonModalElement;

  constructor(private navController: NavController,
              private ngZone: NgZone,
              private store: Store,
              private router: Router,
              private modalController: ModalController) {
  }

  @Selector()
  static user(state: AccountStateModel) {
    return state.user;
  }

  @Selector()
  static session(state: AccountStateModel) {
    return state.session;
  }

  @Selector()
  static distance(state: AccountStateModel) {
    return state.user.prefs.distance;
  }

  @Selector()
  static isAuthenticated(state: AccountStateModel): boolean {
    return !!state.user;
  }

  @Action(Account.Login)
  async login(
    {patchState, dispatch}: StateContext<AccountStateModel>,
    action: Account.Login
  ) {
    const {email, password} = action.payload;
    try {
      await Appwrite.accountProvider().createEmailSession(email, password);
      await dispatch(new Account.Fetch());
      dispatch(new Account.Redirect({path: Path.default, forward: true, navigateRoot: false}));
    } catch (e: any) {
      this.handleError(e, dispatch);
    }
  }

  @Action(Account.Signup)
  async signup(
    {patchState, dispatch}: StateContext<AccountStateModel>,
    action: Account.Signup
  ) {
    const {email, password, name, profilePicture} = action.payload;
    try {
      const user = await Appwrite.accountProvider().create(
        'unique()',
        email,
        password,
        name
      ) as AccountModel.User;
      const session = await Appwrite.accountProvider().createEmailSession(email, password);
      await Appwrite.accountProvider().updatePrefs(prefs);
      user.pictureBreaker = await this.updateProfilePicture(profilePicture, user.$id, dispatch);
      patchState({
        user,
        session,
      });
      dispatch(new Account.Redirect({path: Path.default, forward: true, navigateRoot: false}));
    } catch (e: any) {
      await this.handleError(e, dispatch);
    }
  }

  @Action(Account.Fetch)
  async fetch(
    {patchState, dispatch}: StateContext<AccountStateModel>,
    action: Account.Fetch
  ) {
    let user = this.store.selectSnapshot(AccountState.user);
    let session = this.store.selectSnapshot(AccountState.session);

    try {
      // If session is already fetched, don't fetch again
      if (!session) {
        session = await Appwrite.accountProvider().getSession('current') as Models.Session;
        patchState({
          session
        });
      }

      // If user is already fetched, don't fetch again
      if (!user.$id) {
        user = await Appwrite.accountProvider().get() as AccountModel.User;
      }

      // Set cacheBreaker to force image reload if not set
      if (!user.pictureBreaker) {
        user.pictureBreaker = Picture.cacheBreaker();
      }

      await dispatch(new Location.FetchLastLocation({user}));
      patchState({
        user
      });
    } catch (e: any) {
      // Ignore if route is reset password
      const isResetPassword = new RegExp('^(\\/reset-password\\?)').test(this.router.url);
      if (isResetPassword) {
        console.warn('Reset password. Skip login redirect.');
        return;
      }

      this.handleError(e, dispatch);
    }
  }

  @Action(Account.Update)
  async update(
    {patchState, dispatch}: StateContext<AccountStateModel>,
    action: Account.Update
  ) {
    const {prefs, profilePicture, name} = action.payload;
    let user: AccountModel.User = this.store.selectSnapshot(AccountState.user);
    let updated_user = {} as AccountModel.User;

    if (!!name) {
      updated_user = await this.updateUserName(name, dispatch);
      user = {...user, ...updated_user} as AccountModel.User;
    }

    if (!!prefs) {
      const updated_prefs = {...user.prefs, ...prefs};
      updated_user = await this.updateUserPrefs(updated_prefs, patchState, dispatch);
      user = {...user, ...updated_user} as AccountModel.User;
    }

    if (!!profilePicture) {
      updated_user.pictureBreaker = await this.updateProfilePicture(profilePicture, user.$id, dispatch);
      user = {...user, ...updated_user} as AccountModel.User;
    }

    patchState({
      user
    });
  }

  @Action(Account.Logout)
  async logout(
    {patchState, dispatch}: StateContext<AccountStateModel>,
    action: Account.Logout
  ) {
    try {
      await Appwrite.accountProvider().deleteSession('current');
      patchState({
        user: {
          prefs
        } as unknown as AccountModel.User,
        session: null,
      });
      dispatch(new Account.Redirect({path: Path.login, forward: false, navigateRoot: true}));
    } catch (e: any) {
      this.handleError(e, dispatch);
    }
  }

  @Action(Account.SendResetEmail)
  async sendResetEmail(
    {patchState, dispatch}: StateContext<AccountStateModel>,
    action: Account.SendResetEmail
  ) {
    const email = action.payload;
    try {
      await Appwrite.accountProvider().createRecovery(email, `${environment.appUrl}/reset-password'`);

      const toastData = {} as any;
      toastData.message = 'Mail gesendet. Bitte prüfe deine E-Mails.';

      await this.store.dispatch(new GlobalActions.ShowToast({error: toastData as Error, color: 'success'}));
    } catch (e: any) {
      this.handleError(e, dispatch);
    }
  }

  @Action(Account.ResetPassword)
  async resetPassword(
    {patchState, dispatch}: StateContext<AccountStateModel>,
    action: Account.ResetPassword
  ) {
    const {secret, userId, password, confirmPassword} = action.payload;
    try {
      await Appwrite.accountProvider().updateRecovery(userId, secret, password, confirmPassword);

      const toastData = {} as any;
      toastData.message = 'Passwort erfolgreich zurückgesetzt. Bitte melde dich an.';

      await this.store.dispatch(new GlobalActions.ShowToast({error: toastData as Error, color: 'success'}));
      this.store.dispatch(new Account.Redirect({path: Path.login, forward: false, navigateRoot: false}));
    } catch (e: any) {
      this.handleError(e, dispatch);
    }
  }

  @Action(Account.Redirect)
  redirect(ctx: StateContext<AccountStateModel>, action: Account.Redirect) {
    const {path, forward, navigateRoot} = action.payload;
    const currentUrl = this.router.url;

    if (currentUrl.includes(path)) {
      return;
    }

    this.ngZone.run(() => {
      if (navigateRoot) {
        this.navController.navigateRoot([path]);
      }

      if (forward) {
        this.navController.navigateForward([path]);
      } else {
        this.navController.navigateBack([path]);
      }
    });
  }

  @Action(Account.ResetPasswordExpired)
  resetPasswordExpired(ctx: StateContext<AccountStateModel>, action: Account.ResetPasswordExpired) {
    const toastData = {} as any;
    toastData.message = 'Passwort zurücksetzen ist abgelaufen. Bitte versuche es erneut.';

    this.store.dispatch(new GlobalActions.ShowToast({error: toastData as Error, color: 'danger'}));
    this.store.dispatch(new Account.Redirect({path: Path.login, forward: false, navigateRoot: false}));
  }

  @Action(Account.ResetBackendUnderMaintenance)
  resetBackendUnderMaintenance(ctx: StateContext<AccountStateModel>, action: Account.ResetBackendUnderMaintenance) {
    const toastData = {} as any;
    toastData.message = 'Verbindung wiederhergestellt.';

    this.store.dispatch(new GlobalActions.ShowToast({error: toastData as Error, color: 'success'}));
    this.backendUnderMaintenanceModal = null;
  }

  private async updateUserName(name: string, dispatch: (actions: any) => Observable<void>) {
    try {
      const user = await Appwrite.accountProvider().updateName(name) as AccountModel.User;
      return user;
    } catch (e: any) {
      this.handleError(e, dispatch);
    }
  }

  private async updateProfilePicture(profilePictureString: string, userId, dispatch: (actions: any) => Observable<void>) {
    try {
      const picture = await Picture.convertToPicture(profilePictureString) as unknown as File;
      await Appwrite.storageProvider().createFile('profile-picture', userId, picture,
        [
          Permission.read(Role.users()),
          Permission.delete(Role.user(userId)),
          Permission.write(Role.user(userId)),
        ]);
      return Picture.cacheBreaker();
    } catch (e: any) {
      this.handleError(e, dispatch);
    }
  }

  private async updateUserPrefs(prefs: AccountModel.UserPrefs, patchState: (val: Partial<AccountStateModel>) => AccountStateModel, dispatch: (actions: any) => Observable<void>) {
    try {
      return await Appwrite.accountProvider().updatePrefs(prefs) as AccountModel.User;
    } catch (e: any) {
      this.handleError(e, dispatch);
    }
  }

  private async handleError(e: any, dispatch: (actions: any) => Observable<void>) {
    if (this.backendUnderMaintenanceModal) {
      return;
    }

    if (e.type === 'general_unauthorized_scope') {
      dispatch(new Account.Redirect({path: Path.login, forward: true, navigateRoot: false}));
      return;
    }

    if (e.name === 'AppwriteException' && e.code === 0) {
      this.backendUnderMaintenanceModal = await this.modalController.create({
        component: BackendUnderMaintenanceComponent,
        cssClass: 'fullscreen',
      });

      await this.backendUnderMaintenanceModal.present();
      return;
    }

    dispatch(
      new GlobalActions.ShowToast({
        error: e,
        color: 'danger',
      })
    );
  }
}
