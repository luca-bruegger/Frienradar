import { Component, OnInit } from '@angular/core';
import { AccountState, UserRelation, UserRelationState } from '../../store';
import { Store } from '@ngxs/store';
import FriendModel from '../../model/friend';
import { Picture } from '../../helper/picture';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.page.html',
  styleUrls: ['./friends.page.scss'],
})
export class FriendsPage implements OnInit {
  friends: string[] = [];
  invitationCount: number = null;
  reloadTime = 0;
  percent = 0;
  currentCacheBreaker = Picture.cacheBreaker();

  private interval: any;

  constructor(private store: Store) {}

  get reloadPossible() {
    return this.reloadTime === 0;
  }

  ngOnInit() {
    this.store.select(UserRelationState.receivedFriendRequests).subscribe(requests => {
      this.invitationCount = requests.length;
    });

  }

  async refresh(event: any) {
    const RELOAD_TIME = 10;

    if (this.interval) {
      event.target.complete();
      return;
    }

    this.reloadTime = RELOAD_TIME;
    this.percent = 100;
    this.interval = await setInterval(() => {
      if (this.reloadTime === RELOAD_TIME) {
        event.target.complete();
      }
      this.reloadTime -= 1;
      this.percent = (this.reloadTime / RELOAD_TIME) * 100;
      if (this.reloadTime === 0) {
        clearInterval(this.interval);
        this.interval = null;
      }
    }, 1000);
  }
}
