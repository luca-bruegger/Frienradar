import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Picture } from '../../helper/picture';
import { Appwrite } from '../../helper/appwrite';
import { environment } from '../../../environments/environment';
import { AlertController, NavController } from '@ionic/angular';

@Component({
  selector: 'app-friends-display',
  templateUrl: './friends-display.component.html',
  styleUrls: ['./friends-display.component.scss'],
})
export class FriendsDisplayComponent implements OnInit {
  currentCacheBreaker = Picture.cacheBreaker();
  userId = null;
  contactId = null;
  user$;
  private since: string;

  constructor(private activatedRoute: ActivatedRoute,
              private navController: NavController,
              private alertController: AlertController) {
  }

  async ngOnInit() {
    this.userId = this.activatedRoute.snapshot.paramMap.get('id');
    this.contactId = this.activatedRoute.snapshot.paramMap.get('contactId');
    this.since = this.activatedRoute.snapshot.paramMap.get('since');

    this.user$ = new Promise<any>(async (resolve, reject) => {
      const fetchedUser = await Appwrite.databasesProvider().getDocument(
        environment.radarDatabaseId,
        environment.geolocationsCollectionId,
        this.userId
      );
      const user = Object.assign({}, fetchedUser, {selected: false});
      user.username = await this.fetchUsername(fetchedUser.$id);
      user.description = await this.fetchDescription(fetchedUser.$id);
      user.accounts = await this.fetchAccounts(fetchedUser.$id);
      resolve(user);
    });
  }

  profilePicture() {
    return Picture.profilePictureViewURL(this.userId, this.currentCacheBreaker);
  }

  lastSeen() {
    return new Date(this.since).toLocaleString([], {
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
                    await Appwrite.databasesProvider().deleteDocument(environment.usersDatabaseId,
                      environment.friendsCollectionId,
                      this.contactId);
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

  private async fetchUsername(userId) {
    const document = await Appwrite.databasesProvider().getDocument(environment.usersDatabaseId,
      environment.usernameCollectionId,
      userId);
    return document.username;
  }

  private async fetchDescription(userId) {
    const document = await Appwrite.databasesProvider().getDocument(environment.usersDatabaseId,
      environment.descriptionCollectionId,
      userId);
    return document.value;
  }

  private async fetchAccounts(userId) {
    console.log(userId);
    const document = await Appwrite.databasesProvider().getDocument(environment.usersDatabaseId,
      environment.accountsCollectionId,
      userId);
    console.log(document);
    return document;
  }
}
