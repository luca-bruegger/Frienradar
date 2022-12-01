import { Injectable, NgZone } from '@angular/core';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { Models } from 'appwrite';
import { Appwrite } from 'src/app/helpers/appwrite';
import { GlobalActions } from '../global';
import { Path } from "../../helpers/path";
import { Account as AccountModel } from "../../model/account";
import { Observable } from "rxjs";
import { Picture } from "../../helpers/picture";
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Location } from '../location';

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
      public payload: { email: string; password: string; name: string, profilePicture: string }
    ) {}
  }

  export class Fetch {
    static readonly type = '[Auth] Fetch';
  }

  export class Update {
    static readonly type = '[User] Update';
    constructor(
      public payload: { prefs?: AccountModel.UserPrefs, name?: string, profilePicture?: string }
    ) {}
  }

  export class Login {
    static readonly type = '[Auth] Login';
    constructor(public payload: { email: string; password: string }) {}
  }

  export class Logout {
    static readonly type = '[Auth] Logout';
  }

  /** Events */
  export class Redirect {
    static readonly type = '[Auth] AccountRedirect';
    constructor(public payload: { path: string, forward: boolean }) {}
  }
}

const prefs = {
  description: '',
  distance: 'close',
  accounts: {
    instagram: ''
  }
}

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
  constructor(private navController: NavController,
              private ngZone: NgZone,
              private store: Store,
              private router: Router) {}

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
    { patchState, dispatch }: StateContext<AccountStateModel>,
    action: Account.Login
  ) {
    let { email, password } = action.payload;
    try {
      await Appwrite.accountProvider().createEmailSession(email, password);
      await dispatch(new Account.Fetch);
      dispatch(new Account.Redirect({ path: Path.default, forward: true }));
    } catch (e: any) {
      this.handleError(e, dispatch);
    }
  }

  @Action(Account.Signup)
  async signup(
    { patchState, dispatch }: StateContext<AccountStateModel>,
    action: Account.Signup
  ) {
    let { email, password, name, profilePicture } = action.payload;
    try {
      let user = await Appwrite.accountProvider().create(
        'unique()',
        email,
        password,
        name
      ) as AccountModel.User;
      let session = await Appwrite.accountProvider().createEmailSession(email, password);
      await Appwrite.accountProvider().updatePrefs(prefs);
      user.pictureBreaker = await this.updateProfilePicture(profilePicture, user.$id, dispatch);
      patchState({
        user,
        session,
      });
      dispatch(new Account.Redirect({ path: Path.default, forward: true }));
    } catch (e: any) {
      this.handleError(e, dispatch);
    }
  }

  @Action(Account.Fetch)
  async fetch(
    { patchState, dispatch }: StateContext<AccountStateModel>,
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

      await dispatch(new Location.FetchLastLocation({ user }));
      patchState({
        user
      });
    } catch (e: any) {
      this.handleError(e, dispatch);
    }
  }

  @Action(Account.Update)
  async update(
    { patchState, dispatch }: StateContext<AccountStateModel>,
    action: Account.Update
  ) {
    const { prefs, profilePicture, name } = action.payload;
    let user: AccountModel.User = this.store.selectSnapshot(AccountState.user);
    let updated_user = {} as AccountModel.User;

    if (!!name) {
      updated_user = await this.updateUserName(name, dispatch);
      user = { ...user, ...updated_user } as AccountModel.User;
    }

    if (!!prefs) {
      const updated_prefs = { ...user.prefs, ...prefs };
      updated_user = await this.updateUserPrefs(updated_prefs, patchState, dispatch)
      user = { ...user, ...updated_user } as AccountModel.User;
    }

    if (!!profilePicture) {
      updated_user.pictureBreaker = await this.updateProfilePicture(profilePicture, user.$id, dispatch);
      user = { ...user, ...updated_user } as AccountModel.User;
    }

    patchState({
      user
    });
  }

  @Action(Account.Logout)
  async logout(
    { patchState, dispatch }: StateContext<AccountStateModel>,
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
      dispatch(new Account.Redirect({ path: Path.login, forward: false }));
    } catch (e: any) {
      this.handleError(e, dispatch);
    }
  }

  @Action(Account.Redirect)
  redirect(ctx: StateContext<AccountStateModel>, action: Account.Redirect) {
    const { path, forward } = action.payload;
    const currentUrl = this.router.url;

    if (currentUrl.includes(path)) {
      return;
    }

    this.ngZone.run(() => {
      if (forward) {
        this.navController.navigateForward([path]);
      } else {
        this.navController.navigateBack([path]);
      }
    });
  }

  private async updateUserName(name: string, dispatch: (actions: any) => Observable<void>) {
    try {
      let user = await Appwrite.accountProvider().updateName(name) as AccountModel.User;
      return user;
    } catch (e: any) {
      this.handleError(e, dispatch);
    }
  }

  private async updateProfilePicture(profilePictureString: string, userId, dispatch: (actions: any) => Observable<void>) {
    try {
      const picture = await Picture.convertToPicture(profilePictureString) as unknown as File;
      await Appwrite.storageProvider().createFile('profile-picture', userId, picture);
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

  private handleError(e: any, dispatch: (actions: any) => Observable<void>) {
    if (e.type == 'general_unauthorized_scope') {
      dispatch(new Account.Redirect({ path: Path.login, forward: true }));
      return;
    }

    dispatch(
      new GlobalActions.showToast({
        error: e,
        color: 'danger',
      })
    );
  }
}
