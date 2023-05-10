import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { AccountState, Location, LocationState, UserRelationState } from '../../store';
import { document } from 'ngx-bootstrap/utils';
import { InfiniteScrollCustomEvent } from '@ionic/angular';

@Component({
  selector: 'app-nearby',
  templateUrl: './nearby.page.html',
  styleUrls: ['./nearby.page.scss'],
})
export class NearbyPage implements OnInit {
  currentPage = null;
  selectedDistance = null;

  constructor(private store: Store) {
  }

  get preferredDistance() {
    return this.store.selectSnapshot(AccountState.preferredDistance);
  }

  get nearbyUsers() {
    return this.store.selectSnapshot(LocationState.nearbyUsers);
  }

  get friendRequests() {
    return this.store.selectSnapshot(UserRelationState.receivedFriendRequests);
  }

  get friends() {
    return this.store.selectSnapshot(UserRelationState.friends);
  }

  get requestedFriends() {
    return this.store.selectSnapshot(UserRelationState.requestedFriends);
  }

  get nearbyUsersAmount() {
    return this.nearbyUsers && this.nearbyUsers[this.preferredDistance] ? this.nearbyUsers[this.preferredDistance].length : 0;
  }

  get nearbyUsersForCurrentDistance() {
    if (this.nearbyUsers && this.nearbyUsers[this.preferredDistance]) {
      return this.nearbyUsers[this.preferredDistance].map(nearbyUser => nearbyUser.attributes);
    } else {
      return null;
    }
  }

  get primaryColor() {
    return getComputedStyle(document.body).getPropertyValue('--ion-color-bright');
  }

  async ngOnInit() {
    await this.loadNearbyUsers(1, false);
  }

  identifyNearbyUser(index, nearbyUser) {
    return nearbyUser.$id;
  }

  async fetchMoreNearbyUsers($event: any) {
    await this.loadNearbyUsers(this.currentPage + 1, true);
    await ($event as InfiniteScrollCustomEvent).target.complete();
  }

  async distanceChanged(distance: number) {
    this.selectedDistance = distance;

    if (this.preferredDistance === distance) {
      return;
    }

    this.currentPage = 1;
    await this.loadNearbyUsers(this.currentPage, false);
  }

  async refresh(event) {
    await this.loadNearbyUsers(1, false);
    event.target.complete();
  }

  invitationReceived(user: any) {
    return this.friendRequests.filter(request => request.sender_id === user.id).length > 0;
  }

  isFriend(user: any) {
    return this.friends.filter(friend => friend.id === user.id).length > 0;
  }

  requestedInvitation(user: any) {
    return this.requestedFriends.filter(guid => guid === user.id).length > 0;
  }

  private async loadNearbyUsers(page = 1, append = false) {
    this.currentPage = page;
    await this.store.dispatch(new Location.FetchNearbyUsers({
      page,
      append,
      distance: this.selectedDistance == null ? this.preferredDistance : this.selectedDistance,
      geohash: this.store.selectSnapshot(LocationState.geohash)
    })).toPromise();
  }
}
