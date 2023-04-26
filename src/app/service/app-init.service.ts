import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { LoadingController, Platform } from '@ionic/angular';
import { App } from '@capacitor/app';
import { LocationService } from './location.service';
import OneSignal from 'onesignal-cordova-plugin';
import { environment } from '../../environments/environment';
import { Account, AccountState, UserRelation } from '../store';
import { TokenService } from './token.service';
import { PermissionService } from './permission.service';
import { ActionCableService } from './action-cable.service';

@Injectable({
  providedIn: 'root'
})
export class AppInitService {
  constructor(private store: Store,
              private loadingController: LoadingController,
              private locationService: LocationService,
              private platform: Platform,
              private tokenService: TokenService,
              private permissionService: PermissionService,
              private actionCableService: ActionCableService) {
  }

  isMobile() {
    return this.platform.is('android') || this.platform.is('ios') && this.platform.is('cordova');
  }

  async init(): Promise<boolean> {
    return new Promise(async (resolve) => {
      const loadingSpinner = await this.createLoadingSpinner();

      await this.appstateListener();
      const tokenValid = await this.tokenService.isTokenValid();

      if (tokenValid) {
        await this.fetchCurrentUser();
        await this.fetchUserRelation();
        const user = this.store.selectSnapshot(AccountState.user);
        await this.startServices(user, await this.tokenService.getToken());
        await this.fetchUserData();
      }

      await loadingSpinner.dismiss();
      return resolve(tokenValid);
    });
  }

  async startServices(user, token) {
    await this.locationService.watch();
    this.oneSignalInit(user);
    this.connectToActionCable(token, user.guid);
  }

  private oneSignalInit(user) {
    if (!this.platform.is('cordova')) {
      return;
    }

    OneSignal.setAppId(environment.oneSignalAppId);
    console.log('OneSignal SETUP ---------------------');
    console.log('OneSignal User ID: ', user.guid);
    OneSignal.setExternalUserId(user.guid);
    OneSignal.promptForPushNotificationsWithUserResponse((accepted) => {
      console.log('User accepted notifications: ' + accepted);
    });

    OneSignal.setLogLevel(0, 0);

    // NOTE: Update the setAppId value below with your OneSignal AppId.
    OneSignal.setNotificationOpenedHandler((jsonData) => {
      console.log('notificationOpenedCallback: ' + JSON.stringify(jsonData));
    });

    OneSignal.setNotificationWillShowInForegroundHandler((notificationReceivedEvent) => {
      notificationReceivedEvent.complete(null);
      console.log('notificationWillShowInForegroundHandler: ' + JSON.stringify(notificationReceivedEvent));
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
      if (isActive && this.store.selectSnapshot(AccountState.user) !== null) {
        await this.permissionService.checkPermissions(this.isMobile());
        await this.locationService.watch();
        await this.fetchCurrentUser();
      } else {
        await this.locationService.stop();
      }
    });
  }

  private async fetchCurrentUser() {
    await this.store.dispatch(new Account.Fetch({
      checkValidity: true
    })).toPromise();
  }

  private connectToActionCable(token: string, guid: string) {
    this.actionCableService.connect(token, guid);
  }

  private async fetchUserData() {
    await this.store.dispatch(new UserRelation.FetchFriendRequests()).toPromise();
  }

  private async fetchUserRelation() {
    await this.store.dispatch(new UserRelation.FetchInvitations({page: 1})).toPromise();
    await this.store.dispatch(new UserRelation.FetchFriends({page: 1})).toPromise();
  }
}
