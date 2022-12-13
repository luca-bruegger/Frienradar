import { Injectable, OnDestroy } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { Location, LocationState } from '../../store';
import { Store } from '@ngxs/store';
import * as ngeohash from 'ngeohash';

@Injectable({
  providedIn: 'root'
})
export class LocationService implements OnDestroy {
  private geolocationOptions = {
    enableHighAccuracy: false,
    maximumAge: 10000,
    timeout: 10000
  };
  private locationDelayedJobId: number;


  constructor(private store: Store) {}

  ngOnDestroy() {
    clearInterval(this.locationDelayedJobId);
  }

  async watchGeolocation() {


    await this.watchPosition();
  }

  private async watchPosition() {
    await Geolocation.watchPosition(this.geolocationOptions, (position) => {
      if (position) {
        const geohash = ngeohash.encode(position.coords.latitude, position.coords.longitude, 7);
        this.store.dispatch(new Location.UpdatePosition(geohash));
      }
    });
  }

  randomPosition(value) {
    let geohash = this.store.selectSnapshot(LocationState.geohash);
    geohash = geohash.slice(0, -1) + value;
    this.store.dispatch(new Location.UpdatePosition(geohash));
  }

}
