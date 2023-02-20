import { Injectable, OnDestroy } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { Store } from '@ngxs/store';
import * as ngeohash from 'ngeohash';
import { BackgroundGeolocationPlugin } from '@capacitor-community/background-geolocation';
import { registerPlugin } from '@capacitor/core';
import { Platform } from '@ionic/angular';
import { AccountState, Location } from '../store';
import { GeohashLength } from '../component/element/radar-display/radar-display.component';

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


  constructor(private store: Store,
              private platform: Platform) {
  }

  async ngOnDestroy() {
    await this.stop();
  }

  async watch() {
    if (this.callbackId) {
      return;
    }
    if (!this.platform.is('capacitor')) {
      this.callbackId = await Geolocation.watchPosition(this.geolocationOptions, (position) => {
        if (position && this.store.selectSnapshot(AccountState.isUserIsFullyRegistered)) {
          const geohash = ngeohash.encode(position.coords.latitude, position.coords.longitude, GeohashLength.close);
          this.store.dispatch(new Location.UpdatePosition(geohash));
        }
      });
    } else {
      const backgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>('BackgroundGeolocation');
      await backgroundGeolocation.addWatcher(
        {
          backgroundMessage: 'Cancel to prevent battery drain.',
          backgroundTitle: 'Tracking You.',
          stale: false,
          distanceFilter: 25,
        },
        (location, error) => {
          if (location && this.store.selectSnapshot(AccountState.isUserIsFullyRegistered)) {
            const geohash = ngeohash.encode(location.latitude, location.longitude, GeohashLength.close);
            this.store.dispatch(new Location.UpdatePosition(geohash));
          }
        }
      ).then((id) => {
        this.callbackId = id;
      });
    }
  }

  async stop() {
    console.log('stop location service', this.callbackId);
    const backgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>('BackgroundGeolocation');
    await backgroundGeolocation.removeWatcher({
      id: this.callbackId
    });
    this.callbackId = null;
  }

  async getCurrentPosition() {
    Geolocation.getCurrentPosition(this.geolocationOptions).then((position) => {
      if (position && this.store.selectSnapshot(AccountState.isUserIsFullyRegistered)) {
        const geohash = ngeohash.encode(position.coords.latitude, position.coords.longitude, GeohashLength.close);
        this.store.dispatch(new Location.UpdatePosition(geohash));
      }
    });
  }
}
