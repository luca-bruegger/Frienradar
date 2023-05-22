import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Geolocation } from '@capacitor/geolocation';
import { GlobalActions } from '../store';
import { AndroidSettings, IOSSettings, NativeSettings } from 'capacitor-native-settings';
import { Camera } from '@capacitor/camera';
import OneSignal from 'onesignal-cordova-plugin';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  geolocation = false;
  photo = false;
  notification = false;

  constructor(private store: Store) {
  }

  async requestGeolocation(isMobile: boolean) {
    if (isMobile) {
      await Geolocation.requestPermissions().then((data) => {
        if (data.location === 'denied') {
          this.openMobileSettings('Standort');
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
          this.openMobileSettings('Bilderzugriff');
        }

        this.photo = data.photos === 'granted';
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

  async hasMandatoryPermissions(isMobile: boolean) {
    await this.checkPermissions(isMobile);

    if (isMobile) {
      return this.geolocation && this.photo;
    } else {
      return this.geolocation;
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
    } else {
      const geolocationQuery = await navigator.permissions.query({name: 'geolocation'});
      this.geolocation = geolocationQuery.state === 'granted';
    }
  }

  private async openMobileSettings(actionName: string) {
    this.store.dispatch(new GlobalActions.ShowToast({
      message: actionName + ' muss in den Einstellungen aktiviert werden.',
      color: 'bright'
    }));

    await NativeSettings.open({
      optionIOS: IOSSettings.App,
      optionAndroid: AndroidSettings.Application
    });
  }
}
