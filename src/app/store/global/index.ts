import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { LoadingController, ToastController } from '@ionic/angular';
import { AccountStateModel } from '../account';

export type Alert = {
  error?: any;
  color?: string;
};

export class GlobalStateModel {
}

export namespace GlobalActions {
  export class ShowToast {
    static readonly type = '[Alert] ShowToast';
    constructor(public payload: { error: Error; color: string }) {}
  }
}

@State<GlobalStateModel>({
  name: 'global',
  defaults: {
  }
})

@Injectable()
export class GlobalState {
  constructor(private toastController: ToastController) {
  }

  @Action(GlobalActions.ShowToast)
  async showToast(
    {patchState}: StateContext<GlobalStateModel>,
    action: GlobalActions.ShowToast
  ) {
    const { error, color } = action.payload;
    const toast = await this.toastController.create({
      message: error.message,
      duration: 5000,
      color
    });
    await toast.present();
  }
}
