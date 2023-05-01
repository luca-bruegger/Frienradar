import { Component } from '@angular/core';
import { Store } from '@ngxs/store';
import { AccountState, GlobalActions, Location, LocationState } from '../../store';

@Component({
  selector: 'app-radar',
  templateUrl: 'radar.page.html',
  styleUrls: ['radar.page.scss'],
})
export class RadarPage {
  geohash: string;
  currentDistance = this.store.selectSnapshot(AccountState.preferredDistance);

  constructor(private store: Store) {
    this.store.select(LocationState.geohash).subscribe(state => {
      if (state) {
        this.geohash = state;
      }
    });
  }

  get isRegionalChatAvailable() {
    //return this.currentDistance === 0 || this.currentDistance === 1;
    return false;
  }

  notImplemented() {
    this.store.dispatch(new GlobalActions.ShowToast({message: 'Not implemented yet', color: 'warning'}));
  }

  distanceChanged($event: number) {
    this.currentDistance = $event;
    this.store.dispatch(new Location.FetchNearbyUsers({
      page: 1,
      append: false,
      distance: $event,
      geohash: this.geohash
    }));
  }
}
