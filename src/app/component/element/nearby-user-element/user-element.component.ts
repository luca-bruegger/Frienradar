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

  lastSeen(user) {
    return new Date(user.$updatedAt).toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).replace(',', '');
  }

  async backOut() {
    const alert = await this.alertController.create({
      header: 'Freundschaftsanfrage',
      subHeader: 'Anfrage zurückziehen',
      message: 'Anfrage an ' + this.user.username + ' zurückziehen?',
      buttons: [
        {
          text: 'Abbrechen',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            this.alertController.dismiss();
          }
        },
        {
          text: 'Zurückziehen',
          cssClass: 'primary',
          handler: async () => {
            // const contactId = this.contacts.sentTo.find(contact => contact.recipientId === this.user.$id).contactId;
            this.isLoading = true;
            // this.store.dispatch(new UserRelation.RemoveRequest({contactId})).pipe(first()).subscribe(() => {
            //   this.isLoading = false;
            //   this.store.dispatch(new GlobalActions.ShowToast({message: 'Anfrage zurückgezogen', color: 'primary'}));
            // });
          }
        }
      ]
    });

    await alert.present();
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
