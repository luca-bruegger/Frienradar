import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { UserRelationState, Location, LocationState } from '../../store';
import { GeohashLength } from '../../component/element/radar-display/radar-display.component';
import { document } from 'ngx-bootstrap/utils';

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
  contacts = null;
  friends = null;

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
  autoReloadPercent = 0;

  private geohashLength: number;
  private geohash: string;
  private autoReloadTime = 30;

  constructor(private store: Store) {}

  get nearbyUsersAmount() {
    return this.nearbyUsersMap.size;
  }

  get reloadPossible() {
    return this.reloadData[this.distance].reloadTime === 0;
  }

  ngOnInit() {
    this.checkForNearbyUsersChanges();
    this.checkForLocationChanges();
    this.checkForContactRequestChanges();
    this.startAutoReload();
  }

  identifyNearbyUser(index, nearbyUser) {
    return nearbyUser.$id;
  }

  distanceChanged(distance: string) {
    this.distance = distance;
    this.geohashLength = Number(GeohashLength[distance]);
    this.reloadNearbyUsers(this.geohashLength);
  }

  async refresh(event) {
    const RELOAD_TIME = 10;
    const reloadData: ReloadData = this.reloadData[this.distance] as ReloadData;

    if (reloadData.interval) {
      event.target.complete();
      return;
    }

    this.reloadNearbyUsers(this.geohashLength);

    reloadData.reloadTime = RELOAD_TIME;
    reloadData.percent = 100;
    reloadData.interval = await setInterval(() => {
      if (reloadData.reloadTime === RELOAD_TIME) {
        event.target.complete();
      }
      reloadData.reloadTime -= 1;
      reloadData.percent = (reloadData.reloadTime / RELOAD_TIME) * 100;
      if (reloadData.reloadTime === 0) {
        clearInterval(reloadData.interval);
        reloadData.interval = null;
      }
    }, 1000);
  }

  private async startAutoReload() {
    let currentTime = 0;
    const geohashLengthKeys = Object.keys(GeohashLength).filter(key => !isNaN(Number(key)));
    setInterval(() => {
      if (currentTime === this.autoReloadTime + 1) {
        geohashLengthKeys.forEach(key => {
          this.reloadNearbyUsers(key);
        });
        currentTime = 0;
      }

      this.autoReloadPercent = (currentTime / this.autoReloadTime) * 100;
      currentTime += 1;
    }, 1000);
  }

  private checkForContactRequestChanges() {
    this.contacts = this.store.selectSnapshot(UserRelationState.contacts);
    this.friends = this.store.selectSnapshot(UserRelationState.friends);

    this.store.select(UserRelationState.contacts).subscribe(contactsChange => {
      this.contacts = contactsChange;
    });
    this.store.select(UserRelationState.friends).subscribe(friendsChange => {
      this.friends = friendsChange;
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

  private reloadNearbyUsers(geohashLength) {
    this.store.dispatch(new Location.FetchNearbyUser({
        geohashLength,
        geohash: this.geohash
      }
    ));
  }

  get primaryColor() {
    return getComputedStyle(document.body).getPropertyValue('--ion-color-bright');
  }
}
