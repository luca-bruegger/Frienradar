import { Component } from '@angular/core';
import { Store } from '@ngxs/store';
import { AccountState, LocationState } from '../../store';

@Component({
  selector: 'app-radar',
  templateUrl: 'radar.page.html',
  styleUrls: ['radar.page.scss'],
})
export class RadarPage {
  geohash: string;

  constructor(private store: Store) {
    this.store.select(LocationState.geohash).subscribe(state => {
      if (state) {
        this.geohash = state;
      }
    });
  }

  get currentDistance() {
    return this.store.selectSnapshot(AccountState.distance);
  }
}
