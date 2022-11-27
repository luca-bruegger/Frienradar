import { Injectable } from '@angular/core';
import { Appwrite } from '../../helpers/appwrite';
import { AccountState } from '../../store';
import { Store } from '@ngxs/store';

@Injectable({
  providedIn: 'root'
})
export class RealtimeService {
  private alive = false;

  constructor(private store: Store) {
  }

  private get provider() {
    return Appwrite.providerSingleton;
  }

  getContacts(user) {
    console.warn('init realtime', `databases.radar.collections.contacts.documents.${user.$id}`);
    this.provider.subscribe(`databases.radar.collections.contacts.documents.${user.$id}`, (response) => {
      console.log('realtime Response');
      console.log(response);
    })
  }

  async watchRealtime() {
    this.store.select(AccountState.user).subscribe(user => {
      if (user.$id && !this.alive) {
        this.getContacts(user);
        this.alive = true;
      }
    })
  }
}
