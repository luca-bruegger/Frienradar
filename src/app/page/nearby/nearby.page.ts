import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Location, LocationState } from '../../store';
import { GeohashLength } from '../../component/element/radar-display/radar-display.component';

@Component({
  selector: 'app-nearby',
  templateUrl: './nearby.page.html',
  styleUrls: ['./nearby.page.scss'],
})
export class NearbyPage implements OnInit {
  nearbyUsersMap = new Map();
  nearbyUsers = null;
  percent = 0;
  reloadTime: number;
  isReloading = false;

  private geohashLength: number;
  private geohash: string;

  constructor(private store: Store) {
  }

  get nearbyUsersAmount() {
    return this.nearbyUsersMap.size;
  }

  ngOnInit() {
    this.checkForStorageChanges();
    this.checkForNearbyUsersChanges();
    this.checkForLocationChanges();
  }

  identifyNearbyUser(index, nearbyUser) {
    return nearbyUser.$id;
  }

  distanceChanged(distance: string) {
    this.geohashLength = Number(GeohashLength[distance]);
    this.store.dispatch(new Location.FetchNearbyUser({
        geohashLength: this.geohashLength,
        geohash: this.geohash
      }
    )).toPromise().then(data => {
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

  handleRefresh($event: any) {

  }

  reloadNearbyUsers() {
    this.isReloading = true;
    this.reloadTime = 25;
    this.percent = 0;
    const interval = setInterval(() => {
      this.reloadTime -= 1;
      this.percent += 4;
      if (this.reloadTime === 0) {
        this.isReloading = false;
        clearInterval(interval);
      }
    }, 1000);
  }

  formatTitle() {
    return this.percent + '%';
  }

  private checkForStorageChanges() {
    this.store.select(LocationState.nearbyUsers).subscribe(state => {
      const distanceString = GeohashLength[this.geohashLength];

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
      this.store.dispatch(new Location.FetchNearbyUser({
        geohashLength: this.geohashLength,
        geohash
      }));
    });
  }

  private checkForNearbyUsersChanges() {

  }
}
