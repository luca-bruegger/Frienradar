import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Store } from '@ngxs/store';
import { Account, AccountState } from '../../../store';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

@Component({
  selector: 'app-distance-change',
  templateUrl: './distance-change.component.html',
  styleUrls: ['./distance-change.component.scss'],
})
export class DistanceChangeComponent implements OnInit {
  currentDistance;

  @Output() distanceChange = new EventEmitter<number>();

  constructor(private store: Store) {
    this.store.select(AccountState.preferredDistance).subscribe(state => {
      this.currentDistance = state;
    });
  }

  ngOnInit() {
    this.distanceChange.emit(this.currentDistance);
  }

  async changeDistance($event: any) {
    const distance: number = +$event.detail.value;
    this.store.dispatch(new Account.Update({
      options: {
        preferred_distance: distance
      }
    }));
    this.distanceChange.emit(distance);

    try {
      await Haptics.impact({style: ImpactStyle.Light});
    } catch (e) {
      return;
    }
  }
}
