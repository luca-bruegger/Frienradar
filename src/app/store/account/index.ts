import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { Models } from 'appwrite';
import { GlobalActions } from '../global';
import { Path } from '../../helper/path';
import { NavController, Platform } from '@ionic/angular';
import { AppService } from '../../service/app.service';
import { LocationService } from '../../service/location.service';
import { ApiService } from '../../service/api.service';
import { catchError, tap } from 'rxjs/operators';
import { TokenService } from '../../service/token.service';
import { User } from '../../model/user';
import { TranslocoService } from '@ngneat/transloco';

/* State Model */
@Injectable()
export class AccountStateModel {
  user: User;
  session: Models.Session;
  accountsData: [];
  username: string;
}

export namespace Account {
  /** Actions */
  export class Register {
    static readonly type = '[Auth] Register';

    constructor(
      public payload: { email: string; password: string; name: string; profilePicture: Blob }
    ) {
    }
  }

  export class Login {
    static readonly type = '[Auth] Login';

    constructor(public payload: { email: string; password: string }) {
    }
  }

  export class Fetch {
    static readonly type = '[Auth] Fetch';

  }

  export class SendResetEmail {
    static readonly type = '[Auth] Reset Password Email';

    constructor(public payload: { email: string; modalController: any }) {
    }
  }

  export class SendVerificationEmail {
    static readonly type = '[Auth] Send Verification Email';

    constructor(public payload: { email: string }) {
    }
  }

  export class Verify {
    static readonly type = '[Auth] Verify';

    constructor(public payload: { token: string }) {
    }
  }

  export class Update {
    static readonly type = '[Auth] Update';

    constructor(public payload: { options: any }) {
    }
  }

  export class UpdateWithFormData {
    static readonly type = '[Auth] Update with FormData';

    constructor(public payload: { options: any; modalController: any }) {
    }
  }

  export class ResetPassword {
    static readonly type = '[Auth] Reset Password';

    constructor(public payload: { resetPasswordToken: string; password: string; passwordConfirmation: string }) {
    }
  }

  export class Logout {
    static readonly type = '[Auth] Logout';
  }

  export class ResetState {
    static readonly type = '[Auth] Reset State';
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
  constructor(private store: Store,
              private appService: AppService,
              private platform: Platform,
              private locationService: LocationService,
              private apiService: ApiService,
              private tokenService: TokenService,
              private navController: NavController,
              private translocoService: TranslocoService) {
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
  static preferredDistance(state: AccountStateModel) {
    return state.user.preferred_distance;
  }

  @Selector()
  static invitationCount(state: AccountStateModel) {
    return state.user.invitation_count;
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
  static isAuthenticated(state: AccountStateModel): boolean {
    return !!state.user;
  }

  @Action(Account.Register)
  async register(
    {patchState, dispatch}: StateContext<AccountStateModel>,
    action: Account.Register
  ) {
    const {email, password, name, profilePicture} = action.payload;

    const formData = new FormData();
    formData.append('profile_picture', profilePicture, profilePicture.type);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('name', name);

    return this.apiService.post('/user', formData, true).toPromise().then(async (response: any) => {
      const user = response.body.data;
      await this.tokenService.setTokenFromResponse(response);

      patchState({
        user
      });
    }, async (error) => {
      dispatch(new GlobalActions.HandleAuthError({error}));
    });
  }

  @Action(Account.Login)
  async login(
    {patchState, dispatch}: StateContext<AccountStateModel>,
    action: Account.Login
  ) {
    const {email, password} = action.payload;

    return this.apiService.post('/user/sign_in', {
      user: {
        email,
        password
      }
    }).toPromise().then(async (response: any) => {
      const user = response.body.data;
      await this.tokenService.setTokenFromResponse(response);
      patchState({
        user
      });
    }, async (error) => {
      dispatch(new GlobalActions.HandleAuthError({error}));
    });
  }

  @Action(Account.Update)
  async update(
    {patchState, dispatch}: StateContext<AccountStateModel>,
    action: Account.Update
  ) {
    const {options} = action.payload;

    return this.apiService.put('/current_user', {
      user: options
    }, false).toPromise().then((response: any) => {
      patchState({
        user: response.data
      });
    }, async (error) => {
      dispatch(new GlobalActions.HandleError({error}));
    });
  }

  @Action(Account.UpdateWithFormData)
  async updateWithFormData(
    {patchState, dispatch}: StateContext<AccountStateModel>,
    action: Account.UpdateWithFormData
  ) {
    const {options, modalController} = action.payload;

    const formData = new FormData();
    if (options.profilePicture) {
      formData.append('profile_picture', options.profilePicture, options.profilePicture.type);
      delete options.profilePicture;
    }

    for (const key in options) {
      if (options.hasOwnProperty(key)) {
        const value = options[key];
        formData.append(key, value);
      }
    }

    return this.apiService.put('/current_user/edited', formData, true).pipe(tap(async (response: any) => {
      patchState({
        user: response.data
      });

      dispatch(new GlobalActions.ShowToast({
        message: this.translocoService.translate('edit-profile.updated'),
        color: 'success'
      }));
      await modalController.dismiss();
    }), catchError(async (error) => {
      dispatch(new GlobalActions.HandleError({error}));
    }));
  }

  @Action(Account.Fetch)
  async fetch(
    {patchState, dispatch}: StateContext<AccountStateModel>,
    action: Account.Fetch
  ) {
    return this.apiService.get('/current_user').pipe(tap((response: any) => {
      const user = JSON.parse(response).data;

      patchState({
        user
      });
    }), catchError(async (error) => {
      dispatch(new GlobalActions.HandleError({error}));
    }));
  }

  @Action(Account.Logout)
  async logout(
    {patchState, dispatch}: StateContext<AccountStateModel>,
    action: Account.Logout
  ) {
    return this.apiService.delete('/user/sign_out').toPromise().then((async () => {
      await this.tokenService.removeToken();
      await this.appService.stop();
      await this.navController.navigateRoot('/login');
    })).catch((error) => {
      dispatch(new GlobalActions.HandleAuthError({error}));
    });
  }

  @Action(Account.SendResetEmail)
  async sendResetEmail(
    {patchState, dispatch}: StateContext<AccountStateModel>,
    action: Account.SendResetEmail
  ) {
    const {email, modalController} = action.payload;

    this.apiService.post('/user/password', {
      user: {
        email
      }
    }).toPromise().then(async () => {
      dispatch(new GlobalActions.ShowToast({
        message: this.translocoService.translate('reset-password.email-sent'),
        color: 'success'
      }));
      await modalController.dismiss();
    }, async (error) => {
      dispatch(new GlobalActions.HandleAuthError({error}));
    });
  }

  @Action(Account.ResetPassword)
  async resetPassword(
    {patchState, dispatch}: StateContext<AccountStateModel>,
    action: Account.ResetPassword
  ) {
    const {resetPasswordToken, password, passwordConfirmation} = action.payload;

    return this.apiService.put('/user/password', {
      user: {
        reset_password_token: resetPasswordToken,
        password,
        password_confirmation: passwordConfirmation
      }
    }).toPromise().then(async (response: any) => {
      patchState({
        user: response.data
      });
      await dispatch(new GlobalActions.ShowToast({
        message: this.translocoService.translate('reset-password.login-message'),
        color: 'success'
      }));
      await dispatch(new GlobalActions.Redirect({
        path: Path.login,
        forward: false,
        navigateRoot: false
      }));
    }, async (error) => {
      dispatch(new GlobalActions.HandleAuthError({error}));
    });
  }

  @Action(Account.Verify)
  async verify(
    {patchState, dispatch}: StateContext<AccountStateModel>,
    action: Account.Verify
  ) {
    const {token} = action.payload;

    return this.apiService.get(`/user/confirmation?confirmation_token=${token}`).pipe(tap((response: any) => {
      const user = {...this.store.selectSnapshot(AccountState.user)};
      user.confirmed = true;

      dispatch(new GlobalActions.ShowToast({
        message: this.translocoService.translate('additional-login-data.email-confirmed'),
        color: 'success'
      }));

      patchState({
        user
      });
    }), catchError(async (error) => {
      dispatch(new GlobalActions.HandleAuthError({error}));
    }));
  }

  @Action(Account.SendVerificationEmail)
  async sendVerificationEmail({
                                patchState,
                                dispatch
                              }: StateContext<AccountStateModel>, action: Account.SendVerificationEmail) {
    const {email} = action.payload;
    return this.apiService.post('/user/confirmation', {
      user: {
        email
      }
    }).toPromise().then(() => {
      dispatch(new GlobalActions.ShowToast({
        message: this.translocoService.translate('additional-login-data.email-confirmation-sent'),
        color: 'success'
      }));
    }).catch(error => {
      dispatch(new GlobalActions.HandleAuthError({error}));
    });
  }

  @Action(Account.ResetState)
  async resetState({
                     patchState,
                     dispatch
                   }: StateContext<AccountStateModel>, action: Account.ResetState) {
    patchState({
      user: null,
      session: null,
      username: null,
      accountsData: null
    });
  }
}
