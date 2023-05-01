import { Injectable, NgZone } from '@angular/core';
import { Action, State, StateContext, Store } from '@ngxs/store';
import { ModalController, NavController, ToastController } from '@ionic/angular';
import { AccountStateModel } from '../account';
import { Path } from '../../helper/path';
import { Router } from '@angular/router';
import { TokenService } from '../../service/token.service';

export class GlobalStateModel {

}

export namespace GlobalActions {
  export class ShowToast {
    static readonly type = '[GlobalActions] Show Toast';
    constructor(public payload: { message: string; color: string }) {}
  }

  export class HandleError {
    static readonly type = '[GlobalActions] Handle Error';
    constructor(public payload: { error: Error }) {}
  }

  export class HandleAuthError {
    static readonly type = '[GlobalActions] Handle Login Error';
    constructor(public payload: { error: Error }) {}
  }

  export class ResetBackendUnderMaintenance {
    static readonly type = '[GlobalActions] Reset Backend Under Maintenance';
  }

  export class Redirect {
    static readonly type = '[GlobalActions] Redirect';

    constructor(public payload: { path: string; forward: boolean; navigateRoot: boolean }) {
    }
  }
}

@State<GlobalStateModel>({
  name: 'global',
  defaults: {
  }
})

@Injectable()
export class GlobalState {
  backendUnderMaintenanceModal: HTMLIonModalElement;

  constructor(private toastController: ToastController,
              private store: Store,
              private modalController: ModalController,
              private navController: NavController,
              private ngZone: NgZone,
              private router: Router,
              private tokenService: TokenService) {
  }

  @Action(GlobalActions.ShowToast)
  async showToast(
    {patchState}: StateContext<GlobalStateModel>,
    action: GlobalActions.ShowToast
  ) {
    const { message, color } = action.payload;
    const toast = await this.toastController.create({
      message,
      duration: 5000,
      color
    });
    await toast.present();
  }

  @Action(GlobalActions.ResetBackendUnderMaintenance)
  async resetBackendUnderMaintenance({dispatch}: StateContext<AccountStateModel>, action: GlobalActions.ResetBackendUnderMaintenance) {
    dispatch(new GlobalActions.ShowToast({
      message: 'Verbindung wiederhergestellt.',
      color: 'success'
    }));

    await this.backendUnderMaintenanceModal.dismiss();
    this.backendUnderMaintenanceModal = null;
  }

  @Action(GlobalActions.HandleError)
  async handleError(
    {patchState, dispatch}: StateContext<GlobalStateModel>,
    action: GlobalActions.HandleError
  ) {
    const { error } = action.payload as { error: any };

    if (this.backendUnderMaintenanceModal) {
      return;
    }

    if (error.status === 401 || error.status === 404) {
      await this.tokenService.removeToken();
      dispatch(new GlobalActions.Redirect({path: Path.login, forward: false, navigateRoot: true}));
      return;
    }

    dispatch(
      new GlobalActions.ShowToast({
        message: error.error.message || error.statusText,
        color: 'danger',
      })
    );
  }

  @Action(GlobalActions.HandleAuthError)
  async handleLoginError(
    {patchState, dispatch}: StateContext<GlobalStateModel>,
    action: GlobalActions.HandleAuthError
  ) {
    const { error } = action.payload as { error: any };

    if (this.backendUnderMaintenanceModal) {
      return;
    }

    dispatch(
      new GlobalActions.ShowToast({
        message: error.error,
        color: 'danger',
      })
    );
  }

  @Action(GlobalActions.Redirect)
  async redirect(ctx: StateContext<AccountStateModel>, action: GlobalActions.Redirect) {
    const {path, forward, navigateRoot} = action.payload;
    const currentUrl = this.router.url;

    if (currentUrl.includes(path)) {
      return;
    }

    return this.ngZone.run(async () => {
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
}
