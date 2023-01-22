import { Injectable } from '@angular/core';
import { Appwrite } from '../../helper/appwrite';
import { AccountState, Contact } from '../../store';
import { Store } from '@ngxs/store';

@Injectable({
  providedIn: 'root'
})
export class RealtimeService {
  private alive = false;

  constructor(private store: Store) {}

  private get provider() {
    return Appwrite.providerSingleton;
  }

  watch() {
    this.store.select(AccountState.user).subscribe(user => {
      if (user && !this.alive) {
        this.getContacts(user.$id);
        this.alive = true;
      }
    });
  }

  private getContacts(userId) {
    // this.provider.subscribe(`databases.radar.collections.contacts.documents.${userId}`, (response: any) => {
    //   this.store.dispatch(new Contact.UpdateRequested({ requested: response.payload.requested }));
    // });
  }
}
