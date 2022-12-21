import { Injectable } from '@angular/core';
import { Account } from '../../store';
import { Store } from '@ngxs/store';
import { LoadingController, Platform } from '@ionic/angular';
import { Contact } from '../../store/contact';
import { App } from '@capacitor/app';
import { LocalPermission } from '../../store/local-permission';

@Injectable({
  providedIn: 'root'
})
export class AppInitService {


  constructor(private store: Store,
              private loadingController: LoadingController,
              private platform: Platform) {
  }

  async init() {
    return new Promise(async (resolve, reject) => {
      const loadingSpinner = await this.createLoadingSpinner();
      await this.setupAppStateListener();
      await this.fetchUserFromApi();

      await loadingSpinner.dismiss();
      return resolve(undefined);
    });
  }

  async fetchUserFromApi() {
    await new Promise(async (resolve, reject) => {
      const dispatchResponse = await this.store.dispatch(new Account.Fetch()).toPromise();
      if (dispatchResponse.auth.user) {
        await this.fetchAdditionalUserData();
        return resolve(undefined);
      } else {
        return resolve(undefined);
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
    await this.store.dispatch(new Contact.Fetch()).toPromise();
  }

  private async checkPermissionChanges() {
    this.store.dispatch(new LocalPermission.CheckGeolocation());
    this.store.dispatch(new LocalPermission.CheckPhoto());
    this.store.dispatch(new LocalPermission.CheckNotification());
  }
}
