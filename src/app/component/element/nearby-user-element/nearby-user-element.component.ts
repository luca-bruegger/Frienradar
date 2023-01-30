import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Account as AccountModel } from '../../../model/account';
import { UserRelation } from '../../../store';
import { Picture } from '../../../helper/picture';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-nearby-user-element',
  templateUrl: './nearby-user-element.component.html',
  styleUrls: ['./nearby-user-element.component.scss'],
})
export class NearbyUserElementComponent implements OnInit {
  @Input() user: AccountModel.User;
  @Input() contacts;

  constructor(private store: Store,
              private alertController: AlertController) { }

  get lastSeen() {
    return new Date(this.user.$updatedAt).toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).replace(',', '');
  }

  get isRequested() {
    return this.contacts.sentTo.map(contact => contact.recipientId).includes(this.user.$id);
  }

  get isSentTo() {
    return this.contacts.receivedFrom.map(contact => contact.senderId).includes(this.user.$id);
  }

  ngOnInit() {
  }

  requestUserContact(requestUserId) {
    this.store.dispatch(new UserRelation.Request({ requestUserId }));
  }

  profilePicture() {
    return Picture.profilePictureViewURL(this.user.$id, this.user.pictureBreaker);
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
          handler: () => {
            const contactId = this.contacts.sentTo.find(contact => contact.recipientId === this.user.$id).contactId;
            this.store.dispatch(new UserRelation.RemoveRequest({contactId}));
          }
        }
      ]
    });

    await alert.present();
  }
}
