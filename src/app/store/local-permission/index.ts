import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { Geolocation } from '@capacitor/geolocation';
import { Platform } from '@ionic/angular';
import { GlobalActions } from '../global';
import { Camera } from '@capacitor/camera';
import OneSignal from 'onesignal-cordova-plugin';
import { AndroidSettings, IOSSettings, NativeSettings } from 'capacitor-native-settings';

/* State Model */
@Injectable()
export class LocalPermissionStateModel {
  geolocation: boolean;
  notification: boolean;
  photo: boolean;
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

  export class RequestPhoto {
    static readonly type = '[localPermission] Request Photo';
  }

  export class CheckPhoto {
    static readonly type = '[localPermission] Check Photo';
  }
}

@State<LocalPermissionStateModel>({
  name: 'localPermission',
  defaults: {
    geolocation: null,
    notification: null,
    photo: null
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
  static photo(state: LocalPermissionStateModel) {
    return state.photo;
  }

  @Selector()
  static notification(state: LocalPermissionStateModel) {
    return state.notification;
  }

  @Selector()
  static hasMandatoryPermissions(state: LocalPermissionStateModel) {
    return state.photo && state.geolocation;
  }

  @Action(LocalPermission.RequestGeolocation)
  async requestGeolocation(
    {patchState, dispatch}: StateContext<LocalPermissionStateModel>,
    action: LocalPermission.RequestGeolocation
  ) {
    if (this.isMobile()) {
      await Geolocation.requestPermissions().then((data) => {
        if (data.location === 'denied') {
          this.openSettings('Standort');
        }

        patchState({
          geolocation: data.location === 'granted'
        });
      });
    } else {
      console.log(navigator.geolocation);
    }
  }

  @Action(LocalPermission.CheckGeolocation)
  async checkGeolocation(
    {patchState, dispatch}: StateContext<LocalPermissionStateModel>,
    action: LocalPermission.CheckGeolocation
  ) {
    let isGranted;
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
      OneSignal.promptForPushNotificationsWithUserResponse(response => {
        patchState({
          notification: response
        });

        if (!response) {
          this.openSettings('Benachrichtigung');
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
      OneSignal.getDeviceState(async device => {
        patchState({
          notification: device.hasNotificationPermission
        });
      });
    }
  }

  @Action(LocalPermission.RequestPhoto)
  async requestPhoto(
    {patchState, dispatch}: StateContext<LocalPermissionStateModel>,
    action: LocalPermission.RequestPhoto
  ) {
    if (this.isMobile()) {
      Camera.requestPermissions({permissions: ['photos']}).then((data) => {
        console.warn('REQUEST PERMISSIONS');
        patchState({
          photo: data.photos === 'granted'
        });
        if (data.photos === 'denied') {
          this.openSettings('Bilderzugriff');
        }
      });
    }
  }

  @Action(LocalPermission.CheckPhoto)
  async checkPhoto(
    {patchState, dispatch}: StateContext<LocalPermissionStateModel>,
    action: LocalPermission.CheckPhoto
  ) {
    if (this.isMobile()) {
      Camera.checkPermissions().then((data) => {
        patchState({
          photo: data.photos === 'granted'
        });
      });
    } else {
      patchState({
        photo: true
      });
    }
  }

  private isMobile() {
    return this.platform.is('android') || this.platform.is('ios');
  }

  private openSettings(action: string) {
    if (this.isMobile()) {
      this.store.dispatch(new GlobalActions.ShowToast({
        message: action + ' muss in den Einstellungen aktiviert werden.',
        color: 'bright'
      }));

      NativeSettings.open({
        optionIOS: IOSSettings.App,
        optionAndroid: AndroidSettings.Application
      });
    }
  }
}
