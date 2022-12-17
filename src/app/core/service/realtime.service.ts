import { Injectable } from '@angular/core';
import { Appwrite } from '../../helper/appwrite';
import { AccountState } from '../../store';
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

  async watch() {
    this.store.select(AccountState.user).subscribe(user => {
      if (user && !this.alive) {
        this.getContacts(user.$id);
        this.getNearbyUsers(user.$id);
        this.alive = true;
      }
    });
  }

  private getNearbyUsers(userId) {
    this.provider.subscribe(`databases.radar.collections.geolocations.documents`, (response) => {
      const payload = response.payload as any;
      const selectedDistance = this.store.selectSnapshot(AccountState.distance);
      const distance = payload.$id.slice(-1);
/*      const geohash = payload.geohash;

      const selectedDistance = this.store.selectSnapshot(AccountState.distance);
      console.log(selectedDistance);
      const payloadUserId = payload.$id.substring(0, payload.$id.indexOf('_'));*/

    });
  }

  private getContacts(userId) {
    this.provider.subscribe(`databases.radar.collections.contacts.documents.${userId}`, (response) => {
      console.log('realtime Response');
    });
  }
}
