import { Injectable } from '@angular/core';
import { Account, AccountState, GlobalActions } from '../../store';
import { Store } from '@ngxs/store';
import { LoadingController, Platform } from '@ionic/angular';
import { Contact } from '../../store/contact';
import { Geolocation } from '@capacitor/geolocation';

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
      await this.requestPermissions();
      await this.fetchInitialDataFromApi();

      await loadingSpinner.dismiss();
      return resolve(undefined);
    });
  }

  async fetchInitialDataFromApi() {
    const user = await this.store.dispatch(new Account.Fetch()).toPromise();
    if (user.auth.user.$id) {
      await this.store.dispatch(new Contact.Fetch()).toPromise();
      return;
    }

    const subscription = this.store.select(AccountState.user).subscribe(async userState => {
      if (userState.$id) {
        await this.store.dispatch(new Contact.Fetch()).toPromise();
        subscription.unsubscribe();
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

  private async requestPermissions() {
    if (this.platform.is('android') || this.platform.is('ios')) {
      await Geolocation.requestPermissions().then(data => {
        if (data.location === 'denied') {
          const error = new Error('Location permission denied');
          this.store.dispatch(new GlobalActions.ShowToast({ error, color: 'danger' }));
        }
      });
    }
  }
}
