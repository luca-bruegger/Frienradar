import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { Geolocation, Position } from '@capacitor/geolocation';
import { BehaviorSubject } from 'rxjs';
import { geohashForLocation } from 'geofire-common';
import { Capacitor } from "@capacitor/core";

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  positionSubject: BehaviorSubject<Position> = new BehaviorSubject<Position>(null);
  nearbyUsersSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  geohashSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  private platform: string = Capacitor.getPlatform();

  constructor(private baseService: BaseService) {
    this.watchGeolocation();
  }

  nearbyUsers() {

  }

  watchGeolocation() {
    const options = {
      enableHighAccuracy: false,
      maximumAge: 10000,
      timeout: 10000
    };
    if (this.platform === 'android' || this.platform === 'ios') {
      Geolocation.requestPermissions().then(data => {
        if (data.location === 'denied') {
          alert('Aktivere den Standortzugriff in den Einstellungen damit die App ordnungsgemäss funktioniert.');
        } else {
          this.watchPosition(options);
        }
      });
      return;
    }

    this.watchPosition(options);
  }

  private watchPosition(options) {
    Geolocation.watchPosition(options, (position) => {
      if (position) {
        this.updateUserLocation(position);
      }
    });
  }

  private geohashForCoords(latitude: number, longitude: number) {
    const hash = geohashForLocation([latitude, longitude]);
    return hash.substring(0, 6);
  }

  private updateUserLocation(position: Position) {
    this.positionSubject.next(position);
    const [latitude, longitude] = [position.coords.latitude, position.coords.longitude];
    const geohash = this.geohashForCoords(latitude, longitude);
    if (this.geohashSubject.value === geohash) {
      return;
    }


  }
}
