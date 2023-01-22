import { Component, OnInit } from '@angular/core';
import { Contact, ContactState } from '../../store';
import { Store } from '@ngxs/store';
import { Appwrite } from '../../helper/appwrite';
import { environment } from '../../../environments/environment';
import { Picture } from '../../helper/picture';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-friend-requests',
  templateUrl: './friend-requests.component.html',
  styleUrls: ['./friend-requests.component.scss'],
})
export class FriendRequestsComponent implements OnInit {
  fetchedUsers = [];
  interval = null;
  percent = 0;
  reloadTime = 0;

  constructor(private store: Store,
              private alertController: AlertController) {
  }

  ngOnInit() {
    this.store.select(ContactState.requested).subscribe(requested => {
      this.fetchedUsers = [];
      if (requested) {
        requested.forEach(async (contactId: any) => {
          const user = await this.fetchUser(contactId);
          this.fetchedUsers.push(user);
        });
      }
    });
  }

  async fetchUser(contactId: any) {
    return await Appwrite.databasesProvider().getDocument(
      environment.radarDatabaseId,
      environment.geolocationsCollectionId,
      contactId);
  }

  profilePicture(userId, pictureBreaker) {
    return Picture.profilePictureViewURL(userId, pictureBreaker);
  }

  async openStateSelection(contact) {
    const alert = await this.alertController.create({
      header: 'Freundschaftsanfrage',
      message: 'Anfrage von ' + contact.username + ' annehmen?',
      buttons: [
        {
          text: 'Abbrechen',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        },
        {
          text: 'Ablehnen',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        },
        {
          text: 'Annehmen',
          role: 'confirm',
          handler: () => {
            console.log('Confirm Okay');
          }
        }
        ]
    });

    await alert.present();
  }

  declineRequest(contact) {

  }

  acceptRequest(contact) {

  }

  async refresh() {
    if (this.interval) {
      return;
    }

    this.store.dispatch(new Contact.Fetch());

    this.reloadTime = 25;
    this.percent = 100;
    this.interval = await setInterval(() => {
      this.reloadTime -= 1;
      this.percent = (this.reloadTime / 25) * 100;
      if (this.reloadTime === 0) {
        clearInterval(this.interval);
        this.interval = null;
      }
    }, 1000);
  }
}
