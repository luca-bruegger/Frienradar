import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { AccountState, GlobalActions, Location, LocationState } from '../../store';
import { Appwrite } from '../../helpers/appwrite';
import { GeohashDistance } from '../../component/radar-display/radar-display.component';

@Component({
  selector: 'app-nearby',
  templateUrl: './nearby.page.html',
  styleUrls: ['./nearby.page.scss'],
})
export class NearbyPage implements AfterViewInit {
  nearbyUsersMap = new Map();
  nearbyUsers = null;

  private distance: number;

  constructor(private store: Store) {}

  ngAfterViewInit() {
    this.store.select(LocationState.geohash).subscribe((geohash) => {
      this.store.dispatch(
        new GlobalActions.showToast({
          error: {message: 'geohash changed ' + geohash } as any,
          color: 'success'
        })
      )
      // this.store.dispatch(new Location.FetchNearbyUser({distance: this.distance, geohash}));
    });
  }

  get nearbyUsersAmount() {
    return this.nearbyUsersMap.size;
  }

  private fetchNearbyUsers(geohash: string) {
    if (!geohash) return;

    const currentLocation = geohash.substring(0, 4);


    // Appwrite.providerSingleton.subscribe(`databases.radar.collections.geolocations.documents`, (response) => {
    //   console.log('realtime location update response');
    //   const payload = response.payload as any;
    //   if (payload.$id !== userId) {
    //     this.nearbyUsersMap.set(payload.$id, payload);
    //   }
    //   this.nearbyUsers = Array.from(this.nearbyUsersMap.values());
    // })
  }

  identify(index, item){
    return item.$id;
  }

  distanceChanged(distance: string) {
    this.distance = Number(GeohashDistance[distance]);
    this.store.dispatch(
      new GlobalActions.showToast({
        error: {message: 'distance changed'} as any,
        color: 'warning'
      })
    )
  }
}
