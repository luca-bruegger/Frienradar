import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { LoadingController, ModalController, ToastController } from '@ionic/angular';
import { Account, AccountStateModel } from '../account';
import { Path } from '../../helper/path';
import { BackendUnderMaintenanceComponent } from '../../component/backend-under-maintenance/backend-under-maintenance.component';

export type Alert = {
  error?: any;
  color?: string;
};

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

  export class ResetBackendUnderMaintenance {
    static readonly type = '[GlobalActions] Reset Backend Under Maintenance';
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
              private modalController: ModalController) {
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
  async resetBackendUnderMaintenance(ctx: StateContext<AccountStateModel>, action: GlobalActions.ResetBackendUnderMaintenance) {
    this.store.dispatch(new GlobalActions.ShowToast({
      message: 'Verbindung wiederhergestellt.',
      color: 'success'
    }));

    await this.backendUnderMaintenanceModal.dismiss();
    this.backendUnderMaintenanceModal = null;
  }

  @Action(GlobalActions.HandleError)
  async handleError(
    {patchState}: StateContext<GlobalStateModel>,
    action: GlobalActions.HandleError
  ) {
    const { error } = action.payload as { error: any };

    if (this.backendUnderMaintenanceModal) {
      return;
    }

    if (error.code === 401 && error.type === 'general_unauthorized_scope' && error.type === 'user_unauthorized') {
      this.store.dispatch(new Account.Redirect({path: Path.login, forward: true, navigateRoot: false}));
      return;
    }

    // if (error.name === 'AppwriteException' && error.code === 0) {
    //   this.backendUnderMaintenanceModal = await this.modalController.create({
    //     component: BackendUnderMaintenanceComponent,
    //     cssClass: 'fullscreen',
    //   });
    //
    //   await this.backendUnderMaintenanceModal.present();
    //   return;
    // }

    this.store.dispatch(
      new GlobalActions.ShowToast({
        message: error.message,
        color: 'danger',
      })
    );
  }
}
