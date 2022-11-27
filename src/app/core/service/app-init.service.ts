import { Injectable } from '@angular/core';
import { Account, AccountState, Location } from '../../store';
import { Store } from '@ngxs/store';
import { LoadingController } from '@ionic/angular';
import { Contact } from '../../store/contact';

@Injectable({
  providedIn: 'root'
})
export class AppInitService {
  private user: any;

  constructor(private store: Store,
              private loadingController: LoadingController) {
  }

  async init() {
    return new Promise(async (resolve, reject) => {
      let loadingSpinner = await this.loadingController.create({
        message: 'Lädt ...',
        spinner: 'crescent',
        showBackdrop: true
      });

      await loadingSpinner.present();
      this.user = await this.store.dispatch(new Account.Fetch).toPromise();
      await this.additionalInit();

      await loadingSpinner.dismiss();
      return resolve(undefined);
    });
  }

  async additionalInit() {
    if (this.user.auth.user.$id) {
      await this.store.dispatch(new Contact.Fetch).toPromise();
      return;
    }

    const _subscription = this.store.select(AccountState.user).subscribe(async user => {
      if (user.$id) {
        await this.store.dispatch(new Contact.Fetch).toPromise();
        _subscription.unsubscribe();
      }
    });
  }
}
