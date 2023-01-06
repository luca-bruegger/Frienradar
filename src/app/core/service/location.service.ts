import { Injectable, OnDestroy } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { AccountState, Location } from '../../store';
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
  private callbackId: string;


  constructor(private store: Store) {}

  async ngOnDestroy() {
    await this.stop();
  }

  async watch() {
    if (this.callbackId) {
      return;
    }

    this.callbackId = await Geolocation.watchPosition(this.geolocationOptions, (position) => {
      if (position && this.store.selectSnapshot(AccountState.isUserIsFullyRegistered)) {
        const geohash = ngeohash.encode(position.coords.latitude, position.coords.longitude, 7);
        this.store.dispatch(new Location.UpdatePosition(geohash));
      }
    });
  }

  async stop() {
    await Geolocation.clearWatch({
      id: this.callbackId
    });
    this.callbackId = null;
  }
}
