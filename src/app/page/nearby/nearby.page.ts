import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Location, LocationState } from '../../store';
import { GeohashLength } from '../../component/element/radar-display/radar-display.component';

class ReloadData {
  percent: number;
  reloadTime: number;
  interval: number;
}

class ReloadDatas {
  close: ReloadData;
  nearby: ReloadData;
  remote: ReloadData;
  farAway: ReloadData;
}

@Component({
  selector: 'app-nearby',
  templateUrl: './nearby.page.html',
  styleUrls: ['./nearby.page.scss'],
})
export class NearbyPage implements OnInit {
  nearbyUsersMap = new Map();
  nearbyUsers = null;
  reloadData: ReloadDatas = {
    close: {
      percent: 0,
      reloadTime: 0,
      interval: null
    },
    nearby: {
      percent: 0,
      reloadTime: 0,
      interval: null
    },
    remote: {
      percent: 0,
      reloadTime: 0,
      interval: null
    },
    farAway: {
      percent: 0,
      reloadTime: 0,
      interval: null
    }
  };

  distance: string;

  private geohashLength: number;
  private geohash: string;

  constructor(private store: Store) {}

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
    this.distance = distance;
    this.geohashLength = Number(GeohashLength[distance]);
    this.reloadNearbyUsers();
  }

  async refresh() {
    const reloadData: ReloadData = this.reloadData[this.distance] as ReloadData;

    if (reloadData.interval) {
      return;
    }

    this.reloadNearbyUsers();

    reloadData.reloadTime = 25;
    reloadData.percent = 100;
    reloadData.interval = await setInterval(() => {
      reloadData.reloadTime -= 1;
      reloadData.percent = (reloadData.reloadTime / 25) * 100;
      if (reloadData.reloadTime === 0) {
        clearInterval(reloadData.interval);
        reloadData.interval = null;
      }
    }, 1000);
  }

  private checkForStorageChanges() {

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

  private reloadNearbyUsers() {
    this.store.dispatch(new Location.FetchNearbyUser({
        geohashLength: this.geohashLength,
        geohash: this.geohash
      }
    ));
  }
}
