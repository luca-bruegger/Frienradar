import { Component, Input } from '@angular/core';
import { Store } from '@ngxs/store';
import { UserRelation } from '../../../store';
import { AlertController, NavController } from '@ionic/angular';

@Component({
  selector: 'app-user-element',
  templateUrl: './user-element.component.html',
  styleUrls: ['./user-element.component.scss'],
})
export class UserElementComponent {
  @Input() friendPreview = false;
  @Input() user = null;
  @Input() isSentTo = false;
  @Input() isFriend = false;
  @Input() isRequested = false;
  @Input() isLastElement = false;
  isLoading = false;

  constructor(private store: Store,
              private alertController: AlertController,
              private navController: NavController) {
  }

  async ngOnInit() {

  }

  async requestUserContact(friendId) {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    await this.store.dispatch(new UserRelation.Request({ friendId })).toPromise();
    this.isLoading = false;
  }

  showFriendPreview(id) {
    if (!this.friendPreview) {
      return;
    }

    this.navController.navigateForward(`tabs/friends/display/${id}`);
  }

  navigateToFriends() {
    this.navController.navigateForward('/tabs/friends');
  }
}
