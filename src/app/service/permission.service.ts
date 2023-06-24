import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Geolocation } from '@capacitor/geolocation';
import { GlobalActions } from '../store';
import { AndroidSettings, IOSSettings, NativeSettings } from 'capacitor-native-settings';
import { Camera } from '@capacitor/camera';
import OneSignal from 'onesignal-cordova-plugin';
import { TranslocoService } from '@ngneat/transloco';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  geolocation = false;
  photo = false;
  notification = false;

  constructor(private store: Store,
              private translocoService: TranslocoService) {
  }

  async requestGeolocation(isMobile: boolean) {
    if (isMobile) {
      await Geolocation.requestPermissions().then((data) => {
        if (data.location === 'denied') {
          this.openMobileSettings(this.translocoService.translate('additional-login-data.location-access'));
        }

        this.geolocation = data.location === 'granted';
      });
    } else {
      console.log(navigator.geolocation);
    }
  }

  async requestPhoto(isMobile: boolean) {
    if (isMobile) {
      Camera.requestPermissions({permissions: ['photos']}).then((data) => {
        if (data.photos === 'denied') {
          this.openMobileSettings(this.translocoService.translate('additional-login-data.photo-access'));
        }

        this.photo = data.photos === 'granted';
      }).catch((error) => {
        this.store.dispatch(new GlobalActions.ShowToast({
          message: error.message,
          color: 'danger'
        }));
      });
    }
  }

  async requestNotification(isMobile: boolean) {
    if (isMobile) {
      OneSignal.promptForPushNotificationsWithUserResponse(true, (data) => {
        console.log('DEBUG: OneSignal.promptForPushNotificationsWithUserResponse');
      });
    }
  }

  async checkPermissions(isMobile: boolean) {
    if (isMobile) {
      const geolocationPermission = await Geolocation.checkPermissions();
      this.geolocation = geolocationPermission.location === 'granted';

      const cameraPermission = await Camera.checkPermissions();

      this.photo = cameraPermission.photos === 'granted';

      OneSignal.getDeviceState(async device => {
        this.notification = device.hasNotificationPermission;
      });

      return this.geolocation && this.photo;
    } else {
      const geolocationQuery = await navigator.permissions.query({name: 'geolocation'});
      this.geolocation = geolocationQuery.state === 'granted';

      return this.geolocation;
    }
  }

  private async openMobileSettings(actionName: string) {
    this.store.dispatch(new GlobalActions.ShowToast({
      message: this.translocoService.translate('permission-service.needs-permission', {name: actionName}),
      color: 'bright'
    }));

    await NativeSettings.open({
      optionIOS: IOSSettings.App,
      optionAndroid: AndroidSettings.Application
    });
  }
}
