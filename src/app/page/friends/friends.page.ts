import { Component, OnInit } from '@angular/core';
import { UserRelation, UserRelationState } from '../../store';
import { Store } from '@ngxs/store';
import FriendModel from '../../model/friend';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.page.html',
  styleUrls: ['./friends.page.scss'],
})
export class FriendsPage implements OnInit {
  friends: FriendModel[] = null;
  friendRequestsCount: number = null;
  reloadTime = 0;
  percent = 0;

  private interval: any;

  constructor(private store: Store) {}

  get reloadPossible() {
    return this.reloadTime === 0;
  }

  get count() {
    return this.friends.length;
  }

  ngOnInit() {
    this.store.select(UserRelationState.requestedCount).subscribe(count => {
      this.friendRequestsCount = count;
    });

    this.store.select(UserRelationState.friends).subscribe(friends => {
      this.friends = friends;
    });
  }

  async refresh(event: any) {
    const RELOAD_TIME = 10;

    if (this.interval) {
      event.target.complete();
      return;
    }

    await this.store.dispatch(new UserRelation.FetchFriends());

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
