import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { BaseService } from './base.service';
import { Geolocation, Position } from '@capacitor/geolocation';
import { BehaviorSubject } from 'rxjs';
import { geohashForLocation } from 'geofire-common';
import { UserService } from './user.service';
import { Timestamp } from 'firebase/firestore';
import { Capacitor } from "@capacitor/core";

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  positionSubject: BehaviorSubject<Position> = new BehaviorSubject<Position>(null);
  nearbyUsersSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  geohashSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  private platform: string = Capacitor.getPlatform();

  constructor(private angularFirestore: AngularFirestore,
              private baseService: BaseService,
              private userService: UserService) {
    this.watchGeolocation();
  }

  nearbyUsers() {
    const timestamp = Timestamp.now().toDate();
    timestamp.setHours(timestamp.getHours() - 3);

    return this.angularFirestore.collection('users', ref => ref
      .where('location.timestamp', '>=', timestamp)
      .where('location.geohash', '==', this.geohashSubject.value)
    ).valueChanges().subscribe(querySnapshot => {
      const nearbyUsers = [];
      querySnapshot.forEach((user: any) => {
          const isCurrentUser = user.uid === this.baseService.userSubject.value.uid;
          const isEmptyObject = Object.keys(user).length === 0;

          if (!isCurrentUser && !isEmptyObject) {
            nearbyUsers.push(user);
          }
        }
      );
      this.nearbyUsersSubject.next(nearbyUsers);
      }, error => {
        this.baseService.displayErrorMessage(error.message);
      });
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

    this.userService.setLocation(geohash).then(() => {
      this.geohashSubject.next(geohash);
      this.nearbyUsers();
    });
  }
}
