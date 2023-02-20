import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { LoadingController, Platform } from '@ionic/angular';
import { App } from '@capacitor/app';
import { LocationService } from './location.service';
import { RealtimeService } from './realtime.service';
import OneSignal from 'onesignal-cordova-plugin';
import { environment } from '../../environments/environment';
import { Account, AccountState, UserRelation } from '../store';
import { LocalPermission } from '../store/local-permission';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class AppInitService {
  constructor(private store: Store,
              private loadingController: LoadingController,
              private locationService: LocationService,
              private realtimeService: RealtimeService,
              private platform: Platform,
              private tokenService: TokenService) {
  }

  async init() {
    return new Promise(async (resolve) => {
      const loadingSpinner = await this.createLoadingSpinner();

      await this.appstateListener();


      if (await this.tokenService.isTokenValid()) {
        await this.store.dispatch(new Account.Fetch());
        await this.startServices();
      }

      await loadingSpinner.dismiss();
      return resolve(undefined);
    });
  }

  async startServices() {
    this.realtimeService.watch();
    await this.locationService.watch();
  }

  oneSignalInit() {
    if (!this.platform.is('cordova')) {
      return;
    }

    OneSignal.setAppId(environment.oneSignalAppId);
    OneSignal.setExternalUserId(this.store.selectSnapshot(AccountState.user).$id);

    OneSignal.setLogLevel(0, 0);

    // NOTE: Update the setAppId value below with your OneSignal AppId.
    OneSignal.setNotificationOpenedHandler((jsonData) => {
      console.log('notificationOpenedCallback: ' + JSON.stringify(jsonData));
    });

    OneSignal.setNotificationWillShowInForegroundHandler((jsonData) => {
      console.log('notificationWillShowInForegroundHandler: ' + JSON.stringify(jsonData));
    });
  }

  private async createLoadingSpinner() {
    const spinner = await this.loadingController.create({
      message: 'Lädt ...',
      spinner: 'crescent',
      showBackdrop: true
    });

    await spinner.present();
    return spinner;
  }

  private async appstateListener() {
    App.addListener('appStateChange', async state => {
      const {isActive} = state;
      if (isActive) {
        await this.checkPermissionChanges();
        await this.locationService.watch();
      } else {
        await this.locationService.stop();
      }
    });
  }

  private async checkPermissionChanges() {
    this.store.dispatch(new LocalPermission.CheckGeolocation());
    this.store.dispatch(new LocalPermission.CheckPhoto());
    this.store.dispatch(new LocalPermission.CheckNotification());
  }
}
