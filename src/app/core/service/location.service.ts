import { Injectable, OnDestroy } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { Location } from "../../store";
import { Platform } from '@ionic/angular';
import { Store } from '@ngxs/store';
import Geohash from 'latlon-geohash';

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
  private geohash: string = null;


  constructor(private platform: Platform, private store: Store) {}

  ngOnDestroy() {
    clearInterval(this.locationDelayedJobId);
  }

  async watchGeolocation() {
    if (this.platform.is('android') || this.platform.is('ios')) {
      await Geolocation.requestPermissions().then(data => {
        if (data.location === 'denied') {
          alert('Aktivere den Standortzugriff in den Einstellungen damit die App ordnungsgemäss funktioniert.');
        }
      });
    }

    await this.watchPosition();
  }

  private async watchPosition() {
    await Geolocation.watchPosition(this.geolocationOptions, (position) => {
      if (position) {
        this.geohash = Geohash.encode(position.coords.latitude, position.coords.longitude, 10);
        this.store.dispatch(new Location.UpdatePosition(this.geohash));
      }
    });
  }

  // private locationDelayedJob() {
  //   // update Location every 15 seconds
  //   this.locationDelayedJobId = setInterval(() => {
  //     if (this.position == null) return;
  //     console.log('Location Update');
  //     this.store.dispatch(new Location.UpdatePosition(this.position));
  //   }, 15 * 1000);
  // }
}
