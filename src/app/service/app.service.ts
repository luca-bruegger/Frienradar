import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { LoadingController, Platform } from '@ionic/angular';
import { App } from '@capacitor/app';
import { LocationService } from './location.service';
import OneSignal from 'onesignal-cordova-plugin';
import { environment } from '../../environments/environment';
import { Account, AccountState, GlobalActions, Location, UserRelation } from '../store';
import { TokenService } from './token.service';
import { PermissionService } from './permission.service';
import { ActionCableService } from './action-cable.service';
import { Path } from '../helper/path';
import { SocialAccounts } from '../store/social-accounts';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  adsShown = false;

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

      await this.appStateListener();
      const tokenValid = await this.tokenService.isTokenValid();

      if (tokenValid) {
        await this.fetchCurrentUser();
        await this.redirectAfterSignIn();
      }

      await loadingSpinner.dismiss();
      return resolve(tokenValid);
    });
  }

  async startServices(token) {
    const user = this.store.selectSnapshot(AccountState.user);

    await this.locationService.fetchCurrentPosition();
    await this.locationService.watch();
    this.oneSignalInit(user);
    await this.connectToActionCable(token, user.id);
  }

  async redirectAfterSignIn() {
    const fullyRegistered = await this.isRegistrationCompleted();

    if (fullyRegistered) {
      await this.startServices(await this.tokenService.getToken());
      await this.fetchUserRelation();
      await this.fetchUserData();
      await this.redirectToDefault();
    } else {
      await this.redirectToAdditionalLogin();
    }
  }

  async stop() {
    await this.locationService.stop();
    await this.actionCableService.disconnect();
    await this.store.dispatch(new Account.ResetState());
    await this.store.dispatch(new Location.ResetState());
    await this.store.dispatch(new UserRelation.ResetState());
  }

  private async isRegistrationCompleted() {
    const user = this.store.selectSnapshot(AccountState.user);
    await this.permissionService.checkPermissions(this.isMobile());
    const permitted = this.permissionService.hasMandatoryPermissions(this.isMobile());

    return user.confirmed && permitted && user.username && user.username.length > 0 || false;
  }

  private oneSignalInit(user) {
    if (!this.platform.is('cordova')) {
      return;
    }

    OneSignal.setAppId(environment.oneSignalAppId);
    OneSignal.setExternalUserId(user.id);

    OneSignal.setLogLevel(0, 0);

    OneSignal.setNotificationOpenedHandler((openedEvent) => {
    });

    OneSignal.setNotificationWillShowInForegroundHandler((notificationReceivedEvent) => {
      notificationReceivedEvent.complete(null);
    });
  }

  async createLoadingSpinner() {
    const spinner = await this.loadingController.create({
      message: 'Lädt ...',
      spinner: 'crescent',
      showBackdrop: true
    });

    await spinner.present();
    return spinner;
  }

  private async appStateListener() {
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
    await this.store.dispatch(new Account.Fetch()).toPromise();
  }

  private async connectToActionCable(token: string, userId: string) {
    await this.actionCableService.connect(token, userId);
  }

  private async fetchUserData() {
    await this.store.dispatch(new UserRelation.FetchFriendRequests()).toPromise();
  }

  private async fetchUserRelation() {
    await this.store.dispatch(new UserRelation.FetchInvitations({page: 1})).toPromise();
    await this.store.dispatch(new UserRelation.FetchFriends({page: 1})).toPromise();
    await this.store.dispatch(new SocialAccounts.Fetch()).toPromise();
  }

  private async redirectToDefault() {
    this.store.dispatch(new GlobalActions.Redirect({
      path: Path.default,
      forward: true,
      navigateRoot: true
    }));
  }

  private async redirectToAdditionalLogin() {
    this.store.dispatch(new GlobalActions.Redirect({
      path: Path.additionalLoginData,
      forward: true,
      navigateRoot: false
    }));
  }
}
