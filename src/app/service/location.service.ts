import { Injectable, OnDestroy } from '@angular/core';
import { Geolocation, PositionOptions } from '@capacitor/geolocation';
import { Store } from '@ngxs/store';
import * as ngeohash from 'ngeohash';
import { BackgroundGeolocationPlugin } from '@capacitor-community/background-geolocation';
import { registerPlugin } from '@capacitor/core';
import { Platform } from '@ionic/angular';
import { Location } from '../store';

@Injectable({
  providedIn: 'root'
})
export class LocationService implements OnDestroy {
  private geolocationOptions: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 5000
  };

  private callbackId: string;
  private plugin: BackgroundGeolocationPlugin;
  private geohash: string;
  private readonly DEFAULT_GEOHASH_LENGTH = 6;

  constructor(private store: Store,
              private platform: Platform) {
  }

  get backgroundGeolocation() {
    if (this.plugin) {
      return this.plugin;
    }

    this.plugin = registerPlugin<BackgroundGeolocationPlugin>('BackgroundGeolocation');
    return this.plugin;
  }

  async ngOnDestroy() {
    await this.stop();
  }

  async watch() {
    await this.fetchCurrentPosition();

    if (this.callbackId) {
      return;
    }

    // if (!this.platform.is('capacitor')) {
      Geolocation.watchPosition(this.geolocationOptions, (position) => {
        if (position) {
          const geohash = ngeohash.encode(position.coords.latitude, position.coords.longitude, this.DEFAULT_GEOHASH_LENGTH);
          this.updatePosition(geohash);
        }
      }).then((id) => {
        this.callbackId = id;
      });
    // } else {
    //   await this.backgroundGeolocation.addWatcher(
    //     {
    //       backgroundMessage: 'Abbrechen um Batterie zu sparen.',
    //       backgroundTitle: 'Standort wird ermittelt...',
    //       stale: false,
    //       distanceFilter: 25,
    //     },
    //     (location, error) => {
    //       if (location) {
    //         const geohash = ngeohash.encode(location.latitude, location.longitude, this.DEFAULT_GEOHASH_LENGTH);
    //         this.store.dispatch(new Location.UpdatePosition(geohash));
    //       }
    //     }
    //   ).then((id) => {
    //     this.callbackId = id;
    //   });
    // }
  }

  async stop() {
    if (!this.callbackId) {
      return;
    }

    if (!this.platform.is('capacitor')) {
      await Geolocation.clearWatch({id: this.callbackId});
      this.callbackId = null;
      return;
    }

    await this.backgroundGeolocation.removeWatcher({
      id: this.callbackId
    });
    this.callbackId = null;
  }

  async getCurrentGeohash() {
    return new Promise<string>(async (resolve, reject) => {
      const id = await Geolocation.watchPosition(this.geolocationOptions, (position, err) => {
        Geolocation.clearWatch({id});
        if(err) {
          reject(err);
          return;
        }
        resolve(ngeohash.encode(position.coords.latitude, position.coords.longitude, this.DEFAULT_GEOHASH_LENGTH));
      });
    });
  }

  async fetchCurrentPosition() {
    const geohash = await this.getCurrentGeohash();
    this.updatePosition(geohash);
  }

  private updatePosition(geohash: string) {
    if (this.geohash === geohash) {
      return;
    }

    this.geohash = geohash;
    this.store.dispatch(new Location.UpdatePosition(geohash));
  }
}
