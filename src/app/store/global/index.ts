import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { ToastController } from "@ionic/angular";

export type Alert = {
  message?: string;
  color?: string;
};

export class GlobalStateModel {

}

export namespace GlobalActions {
  export class showToast {
    static readonly type = '[Alert] ShowToast';
    constructor(public payload: Alert) {}
  }
}

@State<GlobalStateModel>({
  name: 'global',
  defaults: {}
})

@Injectable()
export class GlobalState {
  constructor(private toastController: ToastController) {}

  @Action(GlobalActions.showToast)
  async showToast(
    { patchState }: StateContext<GlobalStateModel>,
    action: GlobalActions.showToast
  ) {
    const { message, color } = action.payload;
    const toast = await this.toastController.create({
      message,
      duration: 5000,
      color
    });
    await toast.present();
  }
}
