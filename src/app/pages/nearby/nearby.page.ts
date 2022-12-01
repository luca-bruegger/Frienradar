import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { AccountState, Location, LocationState } from '../../store';
import { GeohashLength } from '../../component/radar-display/radar-display.component';
import { Appwrite } from '../../helpers/appwrite';

@Component({
  selector: 'app-nearby',
  templateUrl: './nearby.page.html',
  styleUrls: ['./nearby.page.scss'],
})
export class NearbyPage implements OnInit {
  nearbyUsersMap = new Map();
  nearbyUsers = null;

  private distance: number;
  private geohash: string;

  constructor(private store: Store) {}

  ngOnInit() {
    this.checkForStorageChanges();
    this.checkForNearbyUsersChanges();
    this.checkForLocationChanges();
  }

  get nearbyUsersAmount() {
    return this.nearbyUsersMap.size;
  }

  identifyNearbyUser(index, nearbyUser){
    return nearbyUser.$id;
  }

  distanceChanged(distance: string) {
    this.distance = Number(GeohashLength[distance]);
    this.store.dispatch(new Location.FetchNearbyUser({distance: this.distance, geohash: this.geohash})).toPromise().then(data => {
      const users = data.location.nearbyUsers[distance];

      if (users) {
        this.nearbyUsersMap.clear();
        users.forEach((user) => {
          this.nearbyUsersMap.set(user.$id, user);
          this.nearbyUsers = Array.from(this.nearbyUsersMap.values());
        });
      }
    });
  }

  private checkForStorageChanges() {
    this.store.select(LocationState.nearbyUsers).subscribe(state => {
      const distanceString = GeohashLength[this.distance];

      // Ignore first state change
      if (!state[distanceString]) {
        this.nearbyUsers = [];
        return;
      }

      this.nearbyUsersMap.clear();
      state[distanceString].forEach((user) => {
        this.nearbyUsersMap.set(user.$id, user);
        this.nearbyUsers = Array.from(this.nearbyUsersMap.values());
      });
    });
  }

  private checkForLocationChanges() {
    this.store.select(LocationState.geohash).subscribe((geohash) => {
      this.geohash = geohash;
      this.store.dispatch(new Location.FetchNearbyUser({distance: this.distance, geohash}));
    });
  }

  private checkForNearbyUsersChanges() {

  }
}
