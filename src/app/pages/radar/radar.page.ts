import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { AccountState, LocationState } from '../../store';
import { LocationService } from '../../core/service/location.service';

@Component({
  selector: 'app-radar',
  templateUrl: 'radar.page.html',
  styleUrls: ['radar.page.scss'],
})
export class RadarPage implements OnInit {
  geohash = null;

  constructor(private store: Store,
              private locationService: LocationService) {
    this.store.select(LocationState.geohash).subscribe(state => {
      if (state) {
        this.geohash = state;
      }
    })
  }

  ngOnInit() {

  }

  get currentDistance() {
    return this.store.selectSnapshot(AccountState.distance);
  }

  updateLocation($event: any) {
    this.locationService.randomPosition($event.detail.value);
  }
}
