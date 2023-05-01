import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';
import { ApiService } from '../../service/api.service';
import { catchError, first } from 'rxjs/operators';

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
              private apiService: ApiService) {
  }

  async ngOnInit() {
    const userId = this.activatedRoute.snapshot.paramMap.get('id');
    this.apiService.get(`/profiles/${userId}`).pipe(first()).subscribe(async (response: any) => {
      this.user = JSON.parse(response).data;
      console.log('Profile', this.user);
    }), catchError(async error => {
      console.error(error);
    });
  }

  lastSeen() {
    return new Date(this.user.friend_since).toLocaleString([], {
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
                    // TODO: delete invitation
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
}
