import { Injectable } from '@angular/core';
import { Account, AccountState } from '../../store';
import { Store } from '@ngxs/store';
import { LoadingController, Platform } from '@ionic/angular';
import { UserRelation } from '../../store/contact';
import { App } from '@capacitor/app';
import { LocalPermission } from '../../store/local-permission';
import { LocationService } from './location.service';
import { RealtimeService } from './realtime.service';
import OneSignal from 'onesignal-cordova-plugin';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AppInitService {
  constructor(private store: Store,
              private loadingController: LoadingController,
              private locationService: LocationService,
              private realtimeService: RealtimeService,
              private platform: Platform) {
  }

  async init() {
    return new Promise(async (resolve, reject) => {
      const loadingSpinner = await this.createLoadingSpinner();

      await this.setupAppStateListener();
      await this.fetchUserFromApi().then(async (hasUser: boolean) => {
        if (hasUser) {
          await this.startServices();
        }
      });

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

    OneSignal.setLogLevel(6, 0);

    // NOTE: Update the setAppId value below with your OneSignal AppId.
    OneSignal.setNotificationOpenedHandler((jsonData) => {
      console.log('notificationOpenedCallback: ' + JSON.stringify(jsonData));
    });

    OneSignal.setNotificationWillShowInForegroundHandler((jsonData) => {
      console.log('notificationWillShowInForegroundHandler: ' + JSON.stringify(jsonData));
    });
  }

  private async fetchUserFromApi(): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      const dispatchResponse = await this.store.dispatch(new Account.Fetch()).toPromise();
      if (dispatchResponse.auth.user) {
        await this.fetchAdditionalUserData();
        return resolve(true);
      } else {
        return resolve(false);
      }
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

  private async setupAppStateListener() {
    App.addListener('appStateChange', async state => {
      await this.checkPermissionChanges();
    });
  }

  private async fetchAdditionalUserData() {
    await this.store.dispatch(new UserRelation.Fetch()).toPromise();
  }

  private async checkPermissionChanges() {
    this.store.dispatch(new LocalPermission.CheckGeolocation());
    this.store.dispatch(new LocalPermission.CheckPhoto());
    this.store.dispatch(new LocalPermission.CheckNotification());
  }
}
