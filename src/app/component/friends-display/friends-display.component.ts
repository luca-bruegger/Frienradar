import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';
import { ApiService } from '../../service/api.service';
import { GlobalActions, UserRelation } from '../../store';
import { Store } from '@ngxs/store';
import { AccountPresets } from '../../helper/accountPresets';

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
              private store: Store) {
  }

  accountPreset(account) {
    return AccountPresets.set[account.provider_key];
  }

  async ngOnInit() {
    const userId = this.activatedRoute.snapshot.paramMap.get('id');
    this.apiService.get(`/profiles/${userId}`).toPromise().then((response: any) => {
      console.log(JSON.parse(response));
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
      header: 'Freundschaft beenden',
      message: 'Möchtest du die Freundschaft wirklich beenden?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Beenden',
          handler: async () => {
            const proof = await this.alertController.create({
              header: 'Freundschaft wirklich beenden?',
              message: 'Möchtest du die Freundschaft endgültig beenden? Diese Aktion kann nicht rückgängig gemacht werden.',
              buttons: [
                {
                  text: 'Cancel',
                  role: 'cancel',
                  cssClass: 'secondary'
                },
                {
                  text: 'Entfernen',
                  cssClass: 'danger',
                  handler: async () => {
                    this.store.dispatch(new UserRelation.RejectInvitation({
                      invitationId: this.user.invitation.id,
                      message: this.user.username + ' wurde als Freund entfernt'
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
