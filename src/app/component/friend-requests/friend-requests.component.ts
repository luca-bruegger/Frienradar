import { Component, OnInit } from '@angular/core';
import { UserRelation, UserRelationState } from '../../store';
import { Store } from '@ngxs/store';
import { Picture } from '../../helper/picture';
import { AlertController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-friend-requests',
  templateUrl: './friend-requests.component.html',
  styleUrls: ['./friend-requests.component.scss'],
})
export class FriendRequestsComponent implements OnInit {
  // requests: {
  //   sender: any;
  //   contactId: string;
  //   createdAt: string;
  // }[] = null;
  requests = null;
  isLoading = false;
  currentCacheBreaker = Picture.cacheBreaker();

  constructor(private store: Store,
              private alertController: AlertController,
              private loadingController: LoadingController) {
  }

  async ngOnInit() {
    this.requests = this.store.selectSnapshot(UserRelationState.receivedFriendRequests);

    if (this.requests === null) {
      await this.store.dispatch(new UserRelation.FetchFriendRequests()).toPromise();
    }

    this.store.select(UserRelationState.receivedFriendRequests).subscribe((requests: any) => {
      this.requests = requests;
    });
  }

  profilePicture(userId) {
    return Picture.profilePictureViewURL(userId, this.currentCacheBreaker);
  }

  async declineRequest(invitationId) {
    const spinner = await this.loadingController.create({
      message: 'Wird Abgelehnt...',
      spinner: 'crescent',
      showBackdrop: true
    });

    await spinner.present();

    await this.store.dispatch(new UserRelation.RejectInvitation({
      invitationId
    })).toPromise();

    await spinner.dismiss();
  }

  async acceptRequest(invitationId) {
    const spinner = await this.loadingController.create({
      message: 'Wird Angenommen...',
      spinner: 'crescent',
      showBackdrop: true
    });

    await spinner.present();
    await this.store.dispatch(new UserRelation.AcceptInvitation({invitationId})).toPromise();
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

  refreshInvitations(event) {
    setTimeout(() => {
      this.store.dispatch(new UserRelation.FetchFriendRequests());
      event.target.complete();
    }, 2000);
  }

  rejectInvitation(invitationId: number, username: string) {
    this.alertController.create({
      header: 'Einladung ablehnen',
      message: `Möchtest du die Einladung wirklich von ${username} wirklich ablehnen?`,
      buttons: [
        {
          text: 'Abbrechen',
          role: 'cancel'
        },
        {
          text: 'Ablehnen',
          handler: async () => {
            await this.declineRequest(invitationId);
          }
        }
      ]
    }).then(alert => alert.present());
  }

  async acceptInvitation(invitationId: number) {
    await this.acceptRequest(invitationId);
  }
}
