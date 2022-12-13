import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { Geolocation } from '@capacitor/geolocation';
import { Platform } from '@ionic/angular';
import { PushNotifications } from '@capacitor/push-notifications';
import { GlobalActions } from '../global';

/* State Model */
@Injectable()
export class LocalPermissionStateModel {
  geolocation: boolean;
  notification: boolean;
}

export namespace LocalPermission {
  /** Actions */
  export class RequestGeolocation {
    static readonly type = '[localPermission] Request Geolocation';
  }

  export class CheckGeolocation {
    static readonly type = '[localPermission] Check Geolocation';
  }

  export class RequestNotification {
    static readonly type = '[localPermission] Request Notification';
  }

  export class CheckNotification {
    static readonly type = '[localPermission] Check Notification';
  }
}

@State<LocalPermissionStateModel>({
  name: 'localPermission',
  defaults: {
    geolocation: false,
    notification: false
  }
})

@Injectable()
export class LocalPermissionState {

  constructor(private store: Store,
              private platform: Platform) {
  }

  @Selector()
  static geolocation(state: LocalPermissionStateModel) {
    return state.geolocation;
  }

  @Selector()
  static notification(state: LocalPermissionStateModel) {
    return state.notification;
  }

  @Action(LocalPermission.RequestGeolocation)
  async requestGeolocation(
    {patchState, dispatch}: StateContext<LocalPermissionStateModel>,
    action: LocalPermission.RequestGeolocation
  ) {
    if (this.isMobile()) {
      Geolocation.requestPermissions().then((data) => {
        if (data.location === 'denied') {
          this.store.dispatch(new GlobalActions.ShowToast({
            message: 'Standort muss in den Einstellungen aktiviert werden.',
            color: 'primary'
          }));
        }

        patchState({
          geolocation: data.location === 'granted'
        });
      });
    }
  }

  @Action(LocalPermission.CheckGeolocation)
  async checkGeolocation(
    {patchState, dispatch}: StateContext<LocalPermissionStateModel>,
    action: LocalPermission.CheckGeolocation
  ) {
    let isGranted = false;
    if (this.isMobile()) {
      const permission = await Geolocation.checkPermissions();
      isGranted = permission.location === 'granted';
    } else {
      const permission = await navigator.permissions.query({name: 'geolocation'});
      isGranted = permission.state === 'granted';
    }
    patchState({
      geolocation: isGranted
    });
  }

  @Action(LocalPermission.RequestNotification)
  async requestNotification(
    {patchState, dispatch}: StateContext<LocalPermissionStateModel>,
    action: LocalPermission.RequestNotification
  ) {
    if (this.isMobile()) {
      PushNotifications.requestPermissions().then(result => {
        if (result.receive === 'granted') {
          // Register with Apple / Google to receive push via APNS/FCM
          PushNotifications.register();

        } else {
          alert('Bitte aktiviere Push-Benachrichtigungen in den Einstellungen, damit die volle App-Funktionalität gewährleistet ist.');
        }
      });
    }
  }

  @Action(LocalPermission.CheckNotification)
  async checkNotification(
    {patchState, dispatch}: StateContext<LocalPermissionStateModel>,
    action: LocalPermission.CheckNotification
  ) {
    if (this.isMobile()) {
      PushNotifications.checkPermissions().then((data) => {
        patchState({
          notification: data.receive === 'granted'
        });
      });
    }
  }

  private isMobile() {
    return this.platform.is('android') || this.platform.is('ios');
  }
}
