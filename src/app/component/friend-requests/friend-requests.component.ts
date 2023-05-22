import { Component, OnInit } from '@angular/core';
import { UserRelation, UserRelationState } from '../../store';
import { Store } from '@ngxs/store';
import { AlertController, LoadingController } from '@ionic/angular';
import { TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'app-friend-requests',
  templateUrl: './friend-requests.component.html',
  styleUrls: ['./friend-requests.component.scss'],
})
export class FriendRequestsComponent implements OnInit {
  requests = null;

  constructor(private store: Store,
              private alertController: AlertController,
              private loadingController: LoadingController,
              private translocoService: TranslocoService) {
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

  async declineRequest(invitationId) {
    const spinner = await this.loadingController.create({
      message: this.translocoService.translate('friend-requests.decline'),
      spinner: 'crescent',
      showBackdrop: true
    });

    await spinner.present();

    await this.store.dispatch(new UserRelation.RejectInvitation({
      invitationId,
      message: this.translocoService.translate('friend-requests.decline-message')
    })).toPromise();

    await spinner.dismiss();
  }

  async acceptRequest(invitationId) {
    const spinner = await this.loadingController.create({
      message: this.translocoService.translate('friend-requests.accept'),
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
      header: this.translocoService.translate('friend-requests.decline-invitation'),
      message: this.translocoService.translate('friend-requests.decline-invitation', {name: username}),
      buttons: [
        {
          text: this.translocoService.translate('general.cancel'),
          role: 'cancel'
        },
        {
          text: this.translocoService.translate('friend-requests.decline-confirm'),
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
