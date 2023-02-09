import { Component, OnInit } from '@angular/core';
import { UserRelation, UserRelationState } from '../../store';
import { Store } from '@ngxs/store';
import { Appwrite } from '../../helper/appwrite';
import { environment } from '../../../environments/environment';
import { Picture } from '../../helper/picture';
import { AlertController, LoadingController } from '@ionic/angular';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-friend-requests',
  templateUrl: './friend-requests.component.html',
  styleUrls: ['./friend-requests.component.scss'],
})
export class FriendRequestsComponent implements OnInit {
  requests: {
    sender: any;
    contactId: string;
    createdAt: string;
  }[] = null;
  isLoading = false;
  currentCacheBreaker = Picture.cacheBreaker();

  constructor(private store: Store,
              private alertController: AlertController,
              private loadingController: LoadingController) {
  }

  ngOnInit() {
    this.store.select(UserRelationState.requested).subscribe(requested => {
      this.requests = [];
      if (requested) {
        requested.forEach(async (request: any) => {
          const user = await this.fetchUser(request.senderId);
          user.username = await this.fetchUsername(user.$id);
          this.requests.push({
            sender: user,
            contactId: request.contactId,
            createdAt: request.createdAt
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

  profilePicture(userId) {
    return Picture.profilePictureViewURL(userId, this.currentCacheBreaker);
  }

  async declineRequest(contactId) {
    this.isLoading = true;
    const spinner = await this.loadingController.create({
      message: 'Wird Abgelehnt...',
      spinner: 'crescent',
      showBackdrop: true
    });

    await spinner.present();
    await this.store.dispatch(new UserRelation.RemoveRequest({contactId})).pipe(first()).subscribe(async () => {
      this.isLoading = false;
      await spinner.dismiss();
    });
  }

  async acceptRequest(senderId) {
    this.isLoading = true;
    const spinner = await this.loadingController.create({
      message: 'Wird Angenommen...',
      spinner: 'crescent',
      showBackdrop: true
    });

    await spinner.present();
    await this.store.dispatch(new UserRelation.AddFriend({senderId})).pipe(first()).subscribe(async () => {
      this.isLoading = false;
      await spinner.dismiss();
    });
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

  private async fetchUsername(userId) {
    const document = await Appwrite.databasesProvider().getDocument(environment.usersDatabaseId,
      environment.usernameCollectionId,
      userId);
    return document.username;
  }
}
