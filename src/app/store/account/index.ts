import { Injectable, NgZone } from '@angular/core';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { Models, Permission, Role } from 'appwrite';
import { Appwrite } from 'src/app/helper/appwrite';
import { GlobalActions } from '../global';
import { Path } from '../../helper/path';
import { Account as AccountModel } from '../../model/account';
import { Observable } from 'rxjs';
import { Picture } from '../../helper/picture';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Location } from '../location';
import { environment } from '../../../environments/environment';
import UserPrefs = AccountModel.UserPrefs;

/* State Model */
@Injectable()
export class AccountStateModel {
  user: AccountModel.User;
  session: Models.Session;
  username: string;
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

  export class VerifyEmail {
    static readonly type = '[Auth] Verify Email';
  }

  export class UpdateVerification {
    static readonly type = '[Auth] Update Verification';

    constructor(public payload: { userId: string; secret: string }) {
    }
  }

  export class UpdateUsername {
    static readonly type = '[Auth] Update Username';

    constructor(public payload: { username: string; userId: string }) {
    }
  }

  export class ResetPassword {
    static readonly type = '[Auth] Reset Password';

    constructor(public payload: { userId: string; secret: string; password: string; confirmPassword: string }) {
    }
  }

  export class VerificationExpired {
    static readonly type = '[Auth] Reset Password expired';

    constructor(public payload: { message: string }) {
    }
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
    user: null,
    session: null,
    username: null
  },
})

@Injectable()
export class AccountState {
  constructor(private navController: NavController,
              private ngZone: NgZone,
              private store: Store,
              private router: Router) {
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
  static username(state: AccountStateModel) {
    return state.username;
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
    } catch (e: any) {
      this.store.dispatch(new GlobalActions.HandleError({error: e as Error}));
    }
  }

  @Action(Account.UpdateUsername)
  async updateUsername(
    {patchState, dispatch}: StateContext<AccountStateModel>,
    action: Account.UpdateUsername
  ) {
    const {userId, username} = action.payload;
    try {
      await Appwrite.databasesProvider().updateDocument(environment.radarDatabaseId, environment.usernameCollectionId, userId, {
        username
      });
      const user = this.store.selectSnapshot(AccountState.user);
      const updatedUser = {...user};
      updatedUser.username = username;

      patchState({
        user: updatedUser
      });

      this.store.dispatch(new Account.Redirect({
        path: Path.default,
        forward: true,
        navigateRoot: false
      }));
      this.store.dispatch(new GlobalActions.ShowToast({
        message: 'Konfiguration erfolgreich abgeschlossen',
        color: 'success'
      }));
    } catch (e: any) {
      if (e.code === 409 && e.type === 'document_already_exists') {
        this.store.dispatch(new GlobalActions.ShowToast({
          message: 'Der Benutzername ist bereits vergeben',
          color: 'danger'
        }));
        return;
      }

      this.store.dispatch(new GlobalActions.HandleError({error: e as Error}));
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
      user.pictureBreaker = await this.updateProfilePicture(profilePicture, user.$id);

      dispatch(new Account.Redirect({path: Path.additionalLoginData, forward: true, navigateRoot: true}));

      patchState({
        user,
        session,
      });
    } catch (e: any) {
      this.store.dispatch(new GlobalActions.HandleError({error: e as Error}));
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
      if (!user) {
        user = await Appwrite.accountProvider().get() as AccountModel.User;
        user.username = await this.getUsername(user);
        if (this.isUserIsFullyRegistered(user)) {
          dispatch(new Account.Redirect({path: Path.default, forward: true, navigateRoot: true}));
        } else {
          dispatch(new Account.Redirect({path: Path.additionalLoginData, forward: true, navigateRoot: true}));
        }
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
        return;
      }

      this.store.dispatch(new GlobalActions.HandleError({error: e as Error}));
    }
  }

  @Action(Account.Update)
  async update(
    {patchState, dispatch}: StateContext<AccountStateModel>,
    action: Account.Update
  ) {
    const {prefs, profilePicture, name} = action.payload;
    let user: AccountModel.User = this.store.selectSnapshot(AccountState.user);
    let updatedUser = {} as AccountModel.User;

    if (!!name) {
      updatedUser = await this.updateName(name, dispatch);
      user = {...user, ...updatedUser} as AccountModel.User;
    }

    if (!!prefs) {
      const updatedPrefs = {...user.prefs, ...prefs};
      updatedUser = await this.updateUserPrefs(updatedPrefs);
      user = {...user, ...updatedUser} as AccountModel.User;
    }

    if (!!profilePicture) {
      updatedUser.pictureBreaker = await this.updateProfilePicture(profilePicture, user.$id);
      user = {...user, ...updatedUser} as AccountModel.User;
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
        user: null,
        session: null
      });
      dispatch(new Account.Redirect({path: Path.login, forward: false, navigateRoot: true}));
    } catch (e: any) {
      this.store.dispatch(new GlobalActions.HandleError({error: e as Error}));
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

      await this.store.dispatch(new GlobalActions.ShowToast({
        message: 'Mail gesendet. Bitte prüfe deine E-Mails.',
        color: 'success'
      }));
    } catch (e: any) {
      this.store.dispatch(new GlobalActions.HandleError({error: e as Error}));
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

      await this.store.dispatch(new GlobalActions.ShowToast({
        message: 'Passwort erfolgreich zurückgesetzt. Bitte melde dich an.',
        color: 'success'
      }));
      this.store.dispatch(new Account.Redirect({path: Path.login, forward: false, navigateRoot: false}));
    } catch (e: any) {
      this.store.dispatch(new GlobalActions.HandleError({error: e as Error}));
    }
  }

  @Action(Account.UpdateVerification)
  async updateVerification(
    {patchState, dispatch}: StateContext<AccountStateModel>,
    action: Account.UpdateVerification
  ) {
    const {userId, secret} = action.payload;
    try {
      await Appwrite.accountProvider().updateVerification(userId, secret);
      const user = this.store.selectSnapshot(AccountState.user);
      const updatedUser = {...user};
      updatedUser.emailVerification = true;

      patchState({
        user: updatedUser
      });

      await this.store.dispatch(new GlobalActions.ShowToast({
        message: 'Email erfolgreich verifiziert.',
        color: 'success'
      }));
    } catch (e: any) {
      this.store.dispatch(new GlobalActions.HandleError({error: e as Error}));
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

  @Action(Account.VerificationExpired)
  verificationExpired(ctx: StateContext<AccountStateModel>, action: Account.VerificationExpired) {
    const {message} = action.payload;
    this.store.dispatch(new GlobalActions.ShowToast({
      message,
      color: 'danger'
    }));
    this.store.dispatch(new Account.Redirect({path: Path.login, forward: false, navigateRoot: false}));
  }

  @Action(Account.VerifyEmail)
  async verifyUserEmail({patchState, dispatch}: StateContext<AccountStateModel>, action: Account.VerificationExpired) {
    try {
      await Appwrite.accountProvider().createVerification(`${environment.appUrl}/additional-login-data`);
    } catch (e: any) {
      this.store.dispatch(new GlobalActions.HandleError({error: e as Error}));
    }
  }

  private async updateName(name: string, dispatch: (actions: any) => Observable<void>) {
    try {
      const user = await Appwrite.accountProvider().updateName(name) as AccountModel.User;
      return user;
    } catch (e: any) {
      this.store.dispatch(new GlobalActions.HandleError({error: e as Error}));
    }
  }

  private async updateProfilePicture(profilePictureString: string, userId) {
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
      this.store.dispatch(new GlobalActions.HandleError({error: e as Error}));
    }
  }

  private async updateUserPrefs(userPrefs: AccountModel.UserPrefs) {
    try {
      return await Appwrite.accountProvider().updatePrefs(userPrefs) as AccountModel.User;
    } catch (e: any) {
      this.store.dispatch(new GlobalActions.HandleError({error: e as Error}));
    }
  }

  private isUserIsFullyRegistered(user) {
    return user.emailVerification && user.username.length > 0;
  }

  private async getUsername(user: Models.Account<{}> & { prefs: UserPrefs; pictureBreaker: string; username: string }) {
    try {
      const document = await Appwrite.databasesProvider().getDocument(environment.radarDatabaseId, environment.usernameCollectionId, user.$id);
      return document.username;
    } catch (e) {
      if (e.code === 404 && e.type === 'document_not_found') {
        try {
          await Appwrite.databasesProvider().createDocument(environment.radarDatabaseId, environment.usernameCollectionId, user.$id,{
            username: '',
            email: user.email
          });
          return '';
        } catch (createError) {
          this.store.dispatch(new GlobalActions.HandleError({
            error: createError
          }));
        }
      }
      this.store.dispatch(new GlobalActions.HandleError({
        error: e
      }));
    }
  }
}
