import { Component, OnInit } from '@angular/core';
import { UserRelation, UserRelationState } from '../../store';
import { Store } from '@ngxs/store';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.page.html',
  styleUrls: ['./friends.page.scss'],
})
export class FriendsPage implements OnInit {
  invitationCount: number = null;

  constructor(private store: Store) {}

  get friends() {
    return this.store.selectSnapshot(UserRelationState.friends);
  }

  ngOnInit() {
    this.store.select(UserRelationState.receivedFriendRequests).subscribe(requests => {
      this.invitationCount = requests.length;
    });
  }

  async refresh($event: any) {
    await this.store.dispatch(new UserRelation.FetchFriends({page: 1})).toPromise();
    $event.target.complete();
  }
}
