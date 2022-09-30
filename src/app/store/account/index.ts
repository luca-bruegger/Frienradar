import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { Models } from 'appwrite';
import { Appwrite } from 'src/app/helpers/appwrite';
import { GlobalActions } from '../global';
import { Path } from "../../helpers/path";
import { User } from "../../model/user";
import { Observable } from "rxjs";
import { Picture } from "../../helpers/picture";

/* State Model */
@Injectable()
export class AccountStateModel {
  user: User;
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
      public payload: Partial<User>
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
    constructor(public payload: { path: string }) {}
  }
}

@State<AccountStateModel>({
  name: 'auth',
  defaults: {
    user: null,
    session: null,
  },
})
@Injectable()
export class AccountState {
  constructor(private router: Router, private ngZone: NgZone, private store: Store) {}

  @Selector()
  static userId(state: AccountStateModel) {
    return state.user.$id;
  }

  @Selector()
  static user(state: AccountStateModel) {
    return state.user;
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
      let account = await Appwrite.accountProvider().get();
      patchState({
        user: account as User,
      });
      dispatch(new Account.Redirect({ path: Path.default }));
    } catch (e: any) {
      console.log('Error Logging in');
      dispatch(
        new GlobalActions.showToast({
          message: e.message,
          color: 'danger',
        })
      );
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
      ) as User;
      let session = await Appwrite.accountProvider().createEmailSession(email, password);
      user.profilePicture = await this.updateProfilePicture(profilePicture, user, dispatch);
      patchState({
        user,
        session,
      });
      dispatch(new Account.Redirect({ path: Path.default }));
    } catch (e: any) {
      alert(JSON.stringify(e));
      dispatch(
        new GlobalActions.showToast({
          message: e.message,
          color: 'danger',
        })
      );
    }
  }

  @Action(Account.Fetch)
  async fetchAccount(
    { patchState, dispatch }: StateContext<AccountStateModel>,
    action: Account.Fetch
  ) {
    try {
      let user = await Appwrite.accountProvider().get() as User;
      user.profilePicture = Picture.viewURL(user.$id);
      // user.profilePicture = await this.loadUserProfilePicture(user.$id, dispatch);
      patchState({
        user
      });
    } catch (e: any) {
      console.log('Error fetching Account');
      dispatch(
        new GlobalActions.showToast({
          message: e.message,
          color: 'danger',
        })
      );
    }
  }

  @Action(Account.Update)
  async update(
    { patchState, dispatch }: StateContext<AccountStateModel>,
    action: Account.Update
  ) {
    const { description, profilePicture, name } = action.payload;
    let user = this.store.selectSnapshot(AccountState.user);
    let updated_user = {} as User;

    if (!!name) {
      updated_user = await this.updateUserName(name, patchState, dispatch)
      user = { ...user, ...updated_user }
    }

    if (!!description) {

    }

    if (!!profilePicture) {
      updated_user.profilePicture = await this.updateProfilePicture(profilePicture, user, dispatch);
      user = { ...user, ...updated_user }
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
      // patchState({
      //   user: null,
      //   session: null,
      // });
      // dispatch(new Account.Redirect({ path: Path.login }));
    } catch (e: any) {
      dispatch(
        new GlobalActions.showToast({
          message: e.message,
          color: 'danger',
        })
      );
    }
  }

  @Action(Account.Redirect)
  redirect(ctx: StateContext<AccountStateModel>, action: Account.Redirect) {
    const { path } = action.payload;
    this.ngZone.run(() => {
      this.router.navigate([path]);
    });
  }

  private async updateUserName(name: string, patchState, dispatch: (actions: any) => Observable<void>) {
    try {
      let user = await Appwrite.accountProvider().updateName(name) as User;
      return user;
    } catch (e: any) {
      dispatch(
        new GlobalActions.showToast({
          message: e.message,
          color: 'danger',
        })
      );
    }
  }

  private async updateProfilePicture(profilePictureString: string, user: Partial<User>, dispatch: (actions: any) => Observable<void>) {
    try {
      const picture = await Picture.convertToPicture(profilePictureString) as unknown as File;
      const profilePicture = await Appwrite.storageProvider().createFile('profile-picture', user.$id, picture) as Models.File;
      return Picture.viewURL(profilePicture.$id);
    } catch (e: any) {
      dispatch(
        new GlobalActions.showToast({
          message: e.message,
          color: 'danger',
        })
      );
    }
  }

  // private async loadUserProfilePicture(uid, dispatch: (actions: any) => Observable<void>): Promise<string> {
  //   try {
  //     let profilePicture = await Appwrite.storageProvider().getFileView('profile-picture', uid) as URL;
  //     return profilePicture.href;
  //   } catch (e: any) {
  //     dispatch(
  //       new GlobalActions.showToast({
  //         message: e.message,
  //         color: 'danger',
  //       })
  //     );
  //   }
  // }
}
