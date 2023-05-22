import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';
import { ApiService } from '../../service/api.service';
import { GlobalActions, UserRelation } from '../../store';
import { Store } from '@ngxs/store';
import { AccountPresets } from '../../helper/accountPresets';
import { TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'app-friends-display',
  templateUrl: './friends-display.component.html',
  styleUrls: ['./friends-display.component.scss'],
})
export class FriendsDisplayComponent implements OnInit {
  user = null;

  constructor(private activatedRoute: ActivatedRoute,
              private navController: NavController,
              private alertController: AlertController,
              private apiService: ApiService,
              private store: Store,
              private translocoService: TranslocoService) {
  }

  accountPreset(account) {
    return AccountPresets.set[account.provider_key];
  }

  async ngOnInit() {
    const userId = this.activatedRoute.snapshot.paramMap.get('id');
    this.apiService.get(`/profiles/${userId}`).toPromise().then((response: any) => {
      this.user = JSON.parse(response).data;
    }, async error => {
      this.store.dispatch(new GlobalActions.HandleError(
        error
      ));
    });
  }

  lastSeen() {
    return new Date(this.user.invitation.updated_at).toLocaleString([], {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(',', '');
  }

  async removeFriend() {
    const alert = await this.alertController.create({
      header: this.translocoService.translate('friends-display.finish-friendship'),
      message: this.translocoService.translate('friends-display.finish-friendship-confirm'),
      buttons: [
        {
          text: this.translocoService.translate('general.cancel'),
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: this.translocoService.translate('friends-display.finish'),
          handler: async () => {
            const proof = await this.alertController.create({
              header: this.translocoService.translate('friends-display.really-finish'),
              message: this.translocoService.translate('friends-display.really-finish-message'),
              buttons: [
                {
                  text: this.translocoService.translate('general.cancel'),
                  role: 'cancel',
                  cssClass: 'secondary'
                },
                {
                  text: this.translocoService.translate('friends-display.remove'),
                  cssClass: 'danger',
                  handler: async () => {
                    this.store.dispatch(new UserRelation.RejectInvitation({
                      invitationId: this.user.invitation.id,
                      message: this.translocoService.translate('friends-display.remove-message', {name: this.user.username})
                      }));

                    this.store.dispatch(new UserRelation.RemoveFriend({
                      id: this.user.id
                    }));
                    await this.navController.navigateBack('/tabs/friends');
                  }
                }
              ]
            });

            await proof.present();
          }
        }
      ]
    });

    await alert.present();
  }

  openExternalLink(account) {
    window.open(this.accountPreset(account).profileUrl + account.username, '_system');
  }
}
