import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Store } from '@ngxs/store';
import { GlobalActions, UserRelation } from '../../../store';
import { Picture } from '../../../helper/picture';
import { AlertController } from '@ionic/angular';
import { Appwrite } from '../../../helper/appwrite';
import { environment } from '../../../../environments/environment';
import { Account as AccountModel } from '../../../model/account';

@Component({
  selector: 'app-user-element',
  templateUrl: './user-element.component.html',
  styleUrls: ['./user-element.component.scss'],
})
export class UserElementComponent implements OnInit, OnChanges {
  @Input() userId = null;
  @Input() user = null;
  @Input() contacts = null;
  @Input() friends = null;
  user$: Promise<Partial<AccountModel.User>>;
  isFriend = false;
  isLoading = false;

  constructor(private store: Store,
              private alertController: AlertController) {
  }

  get isRequested() {
    if (!this.contacts) {
      return false;
    }
    return this.contacts.sentTo.map(contact => contact.recipientId).includes(this.user.$id);
  }

  get isSentTo() {
    if (!this.contacts) {
      return false;
    }
    return this.contacts.receivedFrom.map(contact => contact.senderId).includes(this.user.$id);
  }

  async ngOnInit() {
    this.isFriend = this.friends.includes(this.userId || this.user.$id);
    this.user$ = new Promise<any>(async (resolve, reject) => {
      if (this.user) {
        resolve(this.user);
      } else {
        resolve(await Appwrite.databasesProvider().getDocument(
          environment.radarDatabaseId,
          environment.geolocationsCollectionId,
          this.userId
        ));
      }
    });
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (changes.friends && changes.friends.currentValue) {
      this.isFriend = changes.friends.currentValue.includes(this.userId || this.user.$id);
    }
  }

  async requestUserContact(requestUserId) {
    this.isLoading = true;
    await this.store.dispatch(new UserRelation.Request({ requestUserId }));
    this.isLoading = false;
  }

  profilePicture(user) {
    return Picture.profilePictureViewURL(user.$id, user.pictureBreaker);
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
            const contactId = this.contacts.sentTo.find(contact => contact.recipientId === this.user.$id).contactId;
            this.isLoading = true;
            await this.store.dispatch(new UserRelation.RemoveRequest({contactId}));
            this.isLoading = false;
          }
        }
      ]
    });

    await alert.present();
  }
}
