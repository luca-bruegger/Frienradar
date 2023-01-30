import { Component, OnInit } from '@angular/core';
import { UserRelationState } from '../../store';
import { Store } from '@ngxs/store';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.page.html',
  styleUrls: ['./friends.page.scss'],
})
export class FriendsPage implements OnInit {
  count = 0;

  constructor(private store: Store) { }

  ngOnInit() {
    this.store.select(UserRelationState.requestedCount).subscribe(count => {
      this.count = count;
    });
  }
}
