import { Component, OnInit } from '@angular/core';
import { UserRelation, UserRelationState } from '../../store';
import { Store } from '@ngxs/store';
import { Appwrite } from '../../helper/appwrite';
import { environment } from '../../../environments/environment';
import { Picture } from '../../helper/picture';
import { AlertController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-friend-requests',
  templateUrl: './friend-requests.component.html',
  styleUrls: ['./friend-requests.component.scss'],
})
export class FriendRequestsComponent implements OnInit {
  requests: {
    sender: any;
    contactId: string;
  }[] = null;

  constructor(private store: Store,
              private alertController: AlertController,
              private loadingController: LoadingController) {
  }

  ngOnInit() {
    this.store.select(UserRelationState.requested).subscribe(requested => {
      console.warn('requested', requested);
      this.requests = [];
      if (requested) {
        requested.forEach(async (request: any) => {
          const user = await this.fetchUser(request.senderId);
          this.requests.push({
            sender: user,
            contactId: request.contactId
          });
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

  async declineRequest(contactId) {
    const spinner = await this.loadingController.create({
      message: 'Wird Abgelehnt...',
      spinner: 'crescent',
      showBackdrop: true
    });

    await spinner.present();
    await this.store.dispatch(new UserRelation.RemoveRequest({contactId}));
    await spinner.dismiss();
  }

  async acceptRequest(senderId) {
    const spinner = await this.loadingController.create({
      message: 'Wird Angenommen...',
      spinner: 'crescent',
      showBackdrop: true
    });

    await spinner.present();
    await this.store.dispatch(new UserRelation.AddFriend({senderId}));
    await spinner.dismiss();
  }

  updatedDate(updatedAt) {
    return new Date(updatedAt).toLocaleString([], {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(',', '');
  }

  handleRefresh(event) {
    setTimeout(() => {
      this.store.dispatch(new UserRelation.Fetch());
      event.target.complete();
    }, 2000);
  }
}
