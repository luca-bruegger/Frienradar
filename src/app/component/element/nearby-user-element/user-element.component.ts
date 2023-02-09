import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Store } from '@ngxs/store';
import { GlobalActions, UserRelation } from '../../../store';
import { Picture } from '../../../helper/picture';
import { AlertController } from '@ionic/angular';
import { Appwrite } from '../../../helper/appwrite';
import { environment } from '../../../../environments/environment';
import { Account as AccountModel } from '../../../model/account';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-user-element',
  templateUrl: './user-element.component.html',
  styleUrls: ['./user-element.component.scss'],
})
export class UserElementComponent implements OnInit, OnChanges {
  @Input() contact = null;
  @Input() user = null;
  @Input() contacts = null;
  @Input() friends = null;
  @Input() currentCacheBreaker = Picture.cacheBreaker();
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
    const friendId = this.contact ? this.contact.friendId : this.user.$id;
    this.isFriend = this.friends.map(friend => friend.friendId).includes(friendId);
    this.user$ = new Promise<any>(async (resolve, reject) => {
      const fetchedUser = this.user || await Appwrite.databasesProvider().getDocument(
        environment.radarDatabaseId,
        environment.geolocationsCollectionId,
        this.contact.friendId
      );
      const user = Object.assign({}, fetchedUser, {selected:false});
      user.username = await this.fetchUsername(fetchedUser.$id);
      resolve(user);
    });
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (changes.friends && changes.friends.currentValue) {
      const friendId = this.contact ? this.contact.friendId : this.user.$id;
      this.isFriend = changes.friends.currentValue.map(friend => friend.friendId).includes(friendId);
    }
  }

  async requestUserContact(requestUserId) {
    this.isLoading = true;
    this.store.dispatch(new UserRelation.Request({ requestUserId })).pipe(first()).subscribe(() => {
      this.isLoading = false;
    });
  }

  profilePicture(user) {
    return Picture.profilePictureViewURL(user.$id, this.currentCacheBreaker);
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
            this.store.dispatch(new UserRelation.RemoveRequest({contactId})).pipe(first()).subscribe(() => {
              this.isLoading = false;
              this.store.dispatch(new GlobalActions.ShowToast({message: 'Anfrage zurückgezogen', color: 'primary'}));
            });
          }
        }
      ]
    });

    await alert.present();
  }

  private async fetchUsername(userId) {
    const document = await Appwrite.databasesProvider().getDocument(environment.usersDatabaseId,
      environment.usernameCollectionId,
      userId);
    return document.username;
  }
}
