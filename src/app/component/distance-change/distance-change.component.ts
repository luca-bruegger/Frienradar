import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Account, AccountState } from '../../store';
import { Account as AccountModel } from '../../model/account';
import { Store } from '@ngxs/store';

@Component({
  selector: 'app-distance-change',
  templateUrl: './distance-change.component.html',
  styleUrls: ['./distance-change.component.scss'],
})
export class DistanceChangeComponent implements OnInit {
  currentDistance;

  @Output('distanceChange') distance = new EventEmitter<string>();

  constructor(private store: Store) {
    this.store.select(AccountState.distance).subscribe(state => {
      this.currentDistance = state;
    })
  }

  ngOnInit() {
    this.distance.emit(this.currentDistance)
  }

  changeDistance($event: any) {
    const distance = $event.detail.value;
    this.store.dispatch(new Account.Update({ prefs: { distance } }));
    this.distance.emit(distance);
  }
}
