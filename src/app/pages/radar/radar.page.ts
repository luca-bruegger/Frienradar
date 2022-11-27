import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Account, AccountState, LocationState } from '../../store';
import { Account as AccountModel } from '../../model/account';

@Component({
  selector: 'app-radar',
  templateUrl: 'radar.page.html',
  styleUrls: ['radar.page.scss'],
})
export class RadarPage implements OnInit {
  geohash = null;

  constructor(private store: Store) {
    this.store.select(LocationState).subscribe(state => {
      if (state.geohash) {
        this.geohash = state.geohash.substring(0,7);
        this.geohash = state.geohash;
      }
    })
  }

  ngOnInit() {

  }

  get currentDistance() {
    return this.store.selectSnapshot(AccountState.distance);
  }

  changeDistance($event: any) {
    const distance = $event.detail.value;
    this.store.dispatch(new Account.Update({ prefs: { distance } } as Partial<AccountModel.User>));
  }
}
