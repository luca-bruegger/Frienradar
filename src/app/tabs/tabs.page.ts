import { Component, OnInit } from '@angular/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Store } from '@ngxs/store';
import { AccountState, UserRelationState } from '../store';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
})
export class TabsPage implements OnInit {
  count = 0;

  constructor(private store: Store) {}

  ngOnInit() {
    this.store.select(UserRelationState.receivedFriendRequests).subscribe(requests => {
      this.count = requests && requests.length || 0;
    });
  }

  async changeTab() {
    try {
      await Haptics.impact({style: ImpactStyle.Medium});
    } catch (e) {
      return;
    }
  }
}
