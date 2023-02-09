import { Injectable, NgZone } from '@angular/core';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { Models, Permission, Role } from 'appwrite';
import { Appwrite } from 'src/app/helper/appwrite';
import { GlobalActions } from '../global';
import { Path } from '../../helper/path';
import { Account as AccountModel } from '../../model/account';
import { Picture } from '../../helper/picture';
import { NavController, Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { Location } from '../location';
import { environment } from '../../../environments/environment';
import { AppInitService } from '../../core/service/app-init.service';
import { AccountData } from '../../model/accountData';
import { LocalPermission, LocalPermissionState } from '../local-permission';
import UserPrefs = AccountModel.UserPrefs;

/* State Model */
@Injectable()
export class AccountStateModel {
  user: AccountModel.User;
  session: Models.Session;
  accountsData: [];
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

    constructor(public payload: { username: string; userId: string; email: string }) {
    }
  }

  export class ResetPassword {
    static readonly type = '[Auth] Reset Password';

    constructor(public payload: { userId: string; secret: string; password: string; confirmPassword: string }) {
    }
  }

  export class UpdateAccountsData {
    static readonly type = '[Auth] Update Accounts Data';

    constructor(public payload: { accountsData: AccountData[] }) {
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

  export class InitializeEmptyDocuments {
    static readonly type = '[Auth] Initialize Empty Documents';

    constructor(public payload: { userId: string }) {
    }
  }

  export class FinishAdditionalLogin {
    static readonly type = '[Auth] Finish Additional Login';
  }

  /** Events */
  export class Redirect {
    static readonly type = '[Auth] Account Redirect';

    constructor(public payload: { path: string; forward: boolean; navigateRoot: boolean }) {
    }
  }
}

@State<AccountStateModel>({
  name: 'auth',
  defaults: {
    user: null,
    session: null,
    username: null,
    accountsData: null
  },
})

@Injectable()
export class AccountState {
  constructor(private navController: NavController,
              private ngZone: NgZone,
              private store: Store,
              private router: Router,
              private appInitService: AppInitService,
              private platform: Platform) {
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
  static accountsData(state: AccountStateModel) {
    return state.accountsData;
  }

  @Selector()
  static isUserIsFullyRegistered(state: AccountStateModel) {
    const user = state.user;
    return !!user && user.emailVerification && user.username && user.username.length > 0;
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
      const session = await Appwrite.accountProvider().createEmailSession(email, password);
      await dispatch(new Account.Fetch());
      return session;
    } catch (e: any) {
      this.store.dispatch(new GlobalActions.HandleError({error: e as Error}));
    }
  }

  @Action(Account.UpdateUsername)
  async updateUsername(
    {patchState, dispatch}: StateContext<AccountStateModel>,
    action: Account.UpdateUsername
  ) {
    const {userId, username, email} = action.payload;
    const user = this.store.selectSnapshot(AccountState.user);

    try {
      if (user.username !== username) {
        await Appwrite.databasesProvider().createDocument(environment.usersDatabaseId, environment.usernameCollectionId, userId, {
          email,
          username
        });
        const updatedUser = {...user};
        updatedUser.username = username;

        patchState({
          user: updatedUser
        });
      }
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

  @Action(Account.FinishAdditionalLogin)
  async finishAdditionalLogin(
    {patchState, dispatch}: StateContext<AccountStateModel>,
    action: Account.FinishAdditionalLogin
  ) {
    const user = this.store.selectSnapshot(AccountState.user);
    if (user.username !== null && user.username.length > 0) {
      await dispatch(new Account.InitializeEmptyDocuments({
        userId: user.$id
      }));
      await dispatch(new Account.Redirect({
        path: Path.default,
        forward: true,
        navigateRoot: false
      }));
      await dispatch(new GlobalActions.ShowToast({
        message: 'Konfiguration erfolgreich abgeschlossen',
        color: 'success'
      }));
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
      await Appwrite.accountProvider().updatePrefs({
        distance: 'close'
      });
      await this.updateProfilePicture(profilePicture, user.$id);

      dispatch(new Account.Redirect({path: Path.additionalLoginData, forward: true, navigateRoot: true}));

      patchState({
        user,
        session,
      });
      return user;
    } catch (e: any) {
      this.store.dispatch(new GlobalActions.HandleError({error: e as Error}));
    }
  }

  @Action(Account.Fetch)
  async fetch(
    {patchState, dispatch}: StateContext<AccountStateModel>,
    action: Account.Fetch
  ) {
    await this.fetchSessionData(patchState);
    const session = this.store.selectSnapshot(AccountState.session);

    // If user could not be fetched on login, skip
    if (!session) {
      return;
    }

    await this.fetchUserData(patchState);
    this.appInitService.oneSignalInit();
    await this.checkPermissionChanges();

    const fullyRegistered = this.store.selectSnapshot(AccountState.isUserIsFullyRegistered);
    const geolocationPermission = this.store.selectSnapshot(LocalPermissionState.geolocation);
    const photoPermission = this.store.selectSnapshot(LocalPermissionState.photo);

    const mandatoryMobilePermissions = this.isMobile() && geolocationPermission && photoPermission;
    const mandatoryWebPermissions = !this.isMobile() && geolocationPermission;

    const hasAllPermissions = mandatoryMobilePermissions || mandatoryWebPermissions;

    if (fullyRegistered && hasAllPermissions) {
      this.store.dispatch(new Account.Redirect({path: Path.default, forward: true, navigateRoot: true}));
    } else {
      this.store.dispatch(new Account.Redirect({path: Path.additionalLoginData, forward: true, navigateRoot: false}));
    }

    return dispatch(new Location.FetchLastLocation({
      user: this.store.selectSnapshot(AccountState.user)
    }));
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
      updatedUser = await this.updateName(name);
      user = {...user, ...updatedUser} as AccountModel.User;
    }

    if (!!prefs) {
      const updatedPrefs = {...user.prefs, ...prefs};
      updatedUser = await this.updateUserPrefs(updatedPrefs);
      user = {...user, ...updatedUser} as AccountModel.User;
    }

    if (!!profilePicture) {
      await this.updateProfilePicture(profilePicture, user.$id);
    }

    patchState({
      user
    });
    return user;
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
      await Appwrite.accountProvider().createRecovery(email, `${environment.appUrl}/reset-password`);

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
      const verifiedUser = await Appwrite.accountProvider().get() as AccountModel.User;
      const user = this.store.selectSnapshot(AccountState.user);
      const updatedUser = Object.assign({...user}, {...verifiedUser});

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

    this.ngZone.run(async () => {
      if (navigateRoot) {
        await this.navController.navigateRoot([path]);
      }

      if (forward) {
        await this.navController.navigateForward([path]);
      } else {
        await this.navController.navigateBack([path]);
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

  @Action(Account.UpdateAccountsData)
  async updateAccountsData({
                             patchState,
                             dispatch
                           }: StateContext<AccountStateModel>, action: Account.UpdateAccountsData) {
    const {accountsData} = action.payload;
    const preparedAccountsData = [];

    accountsData.forEach((accountData: AccountData) => {
      preparedAccountsData.push(accountData.key + ':' + accountData.username);
    });

    try {
      await Appwrite.databasesProvider().updateDocument(
        environment.usersDatabaseId,
        environment.accountsCollectionId,
        this.store.selectSnapshot(AccountState.user).$id,
        {accounts: preparedAccountsData});
    } catch (e: any) {
      this.store.dispatch(new GlobalActions.HandleError({error: e as Error}));
    }
  }

  @Action(Account.InitializeEmptyDocuments)
  async initializeEmptyDocuments({
                                   patchState,
                                   dispatch
                                 }: StateContext<AccountStateModel>, action: Account.InitializeEmptyDocuments) {
    const {userId} = action.payload;
    try {
      await Appwrite.databasesProvider().createDocument(
        environment.usersDatabaseId,
        environment.accountsCollectionId,
        userId, {
          accounts: []
        });
    } catch (e: any) {
      console.log(e);
    }
  }

  private async updateName(name: string) {
    try {
      return await Appwrite.accountProvider().updateName(name) as AccountModel.User;
    } catch (e: any) {
      this.store.dispatch(new GlobalActions.HandleError({error: e as Error}));
    }
  }

  private async updateProfilePicture(profilePictureString: string, userId) {
    try {
      const picture = await Picture.convertToPicture(profilePictureString) as unknown as File;
      const updatedPicture = await Appwrite.storageProvider().createFile('profile-picture', userId, picture,
        [
          Permission.read(Role.users()),
          Permission.delete(Role.user(userId)),
          Permission.write(Role.user(userId)),
        ]);
      return await updatedPicture;
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

  private async getUsername(user: Models.Account<unknown> & { prefs: UserPrefs; username: string }) {
    try {
      const document = await Appwrite.databasesProvider().getDocument(
        environment.usersDatabaseId,
        environment.usernameCollectionId,
        user.$id
      );
      return document.username;
    } catch (e) {
      return null;
    }
  }

  private async getDescription(user: Models.Account<unknown> & { prefs: UserPrefs; username: string }) {
    try {
      const document = await Appwrite.databasesProvider().getDocument(
        environment.usersDatabaseId,
        environment.descriptionCollectionId,
        user.$id
      );
      return document.value;
    } catch (e) {
      if (e.code === 404 && e.type === 'document_not_found') {
        await Appwrite.databasesProvider().createDocument(
          environment.usersDatabaseId,
          environment.descriptionCollectionId,
          user.$id, {
            value: ''
          });
        return;
      }
      return null;
    }
  }

  private async fetchUserData(patchState) {
    const user = this.store.selectSnapshot(AccountState.user);
    let userCopy = {...user};

    // If user is already fetched, don't fetch again
    if (!user) {
      try {
        userCopy = await Appwrite.accountProvider().get() as AccountModel.User;
      } catch (e: any) {
        return;
      }
    }

    await this.fetchUserAccountsData(userCopy, patchState);
    // load username if username is not set
    if (!userCopy.username) {
      userCopy.username = await this.getUsername(userCopy);
    }

    // load description if description is not set
    if (!userCopy.description) {
      userCopy.description = await this.getDescription(userCopy);
    }

    // update user in state if user differs from current user
    if (userCopy !== user) {
      patchState({
        user: userCopy
      });
    }
  }

  private async fetchSessionData(patchState) {
    let session = this.store.selectSnapshot(AccountState.session);

    // If session is already fetched, don't fetch again
    if (!session) {
      try {
        session = await Appwrite.accountProvider().getSession('current') as Models.Session;

        patchState({
          session
        });
      } catch (e: any) {
        if (!Path.unauthorizedRoutes.includes(this.router.url.split('?')[0])) {
          console.log('Session expired');
          this.store.dispatch(new Account.Redirect({path: Path.login, forward: false, navigateRoot: false}));
        }
        return;
      }
    }
  }

  private async fetchUserAccountsData(userCopy, patchState) {
    const accountsData = this.store.selectSnapshot(AccountState.accountsData);
    // If user is already fetched, don't fetch again
    if (!accountsData) {
      try {
        const response = await Appwrite.databasesProvider().getDocument(
          environment.usersDatabaseId,
          environment.accountsCollectionId,
          userCopy.$id
        );

        const fetchedAccountsData = response.accounts as string[];
        const preparedAccountsData: AccountData[] = [];

        fetchedAccountsData.forEach((accountData: string) => {
          const [key, username] = accountData.split(':');
          preparedAccountsData.push({key, username});
        });

        patchState({
          accountsData: preparedAccountsData
        });
      } catch (e: any) {
        return;
      }
    }
  }

  private async checkPermissionChanges() {
    await this.checkGeolocationPermission();
    if (!this.isMobile()) {
      return;
    }
    await this.checkPhotosPermission();
    await this.checkNotificationPermission();
  }

  private checkPhotosPermission() {
    return new Promise(async (resolve) => {
      this.store.select(LocalPermissionState.photo).subscribe((photo) => {
        if (photo === null) {
          return;
        }
        resolve(photo);
      });
      await this.store.dispatch(new LocalPermission.CheckPhoto());
    });
  }

  private checkNotificationPermission() {
    return new Promise(async (resolve) => {
      this.store.select(LocalPermissionState.notification).subscribe((notification) => {
        if (notification === null) {
          return;
        }
        resolve(notification);
      });
      await this.store.dispatch(new LocalPermission.CheckNotification());
    });
  }

  private checkGeolocationPermission() {
    return new Promise(async (resolve) => {
      this.store.select(LocalPermissionState.geolocation).subscribe((geolocation) => {

        if (geolocation === null) {
          return;
        }
        resolve(geolocation);
      });
      await this.store.dispatch(new LocalPermission.CheckGeolocation());
    });
  }


  private isMobile() {
    return this.platform.is('android') || this.platform.is('ios') && this.platform.is('cordova');
  }
}
