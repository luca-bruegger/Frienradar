import { Injectable } from '@angular/core';
import { Appwrite } from '../../helpers/appwrite';
import { AccountState, LocationState } from '../../store';
import { Store } from '@ngxs/store';
import { GeohashLength } from '../../component/radar-display/radar-display.component';

@Injectable({
  providedIn: 'root'
})
export class RealtimeService {
  private alive = false;

  constructor(private store: Store) {}

  private get provider() {
    return Appwrite.providerSingleton;
  }

  async watchRealtime() {
    this.store.select(AccountState.user).subscribe(user => {
      if (user.$id && !this.alive) {
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
      console.log('payload geohash', payload.geohash);
      console.log('stored geohash', this.store.selectSnapshot(LocationState.geohash));
      console.log(selectedDistance == GeohashLength[distance]);
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
