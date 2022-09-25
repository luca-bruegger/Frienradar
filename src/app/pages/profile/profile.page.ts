import { Component, OnInit } from '@angular/core';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { first } from 'rxjs/operators';
import { AlertController, IonRouterOutlet, ModalController } from '@ionic/angular';
import { DocumentSnapshot } from '@angular/fire/compat/firestore';
import { Account } from '../../model/account';
import { BaseService } from '../../core/service/base.service';
import { FirestoreService } from '../../core/service/firestore.service';
import { UserService } from '../../core/service/user.service';
import { EditUserProfileComponent } from '../../component/edit-user-profile/edit-user-profile.component';
import { SettingsComponent } from '../../component/settings/settings.component';

@Component({
  selector: 'app-profile',
  templateUrl: 'profile.page.html',
  styleUrls: ['profile.page.scss'],
})
export class ProfilePage implements OnInit {
  user = {} as any;
  accounts = Account.data;

  constructor(private baseService: BaseService,
              private imagePicker: ImagePicker,
              private firestoreService: FirestoreService,
              private userService: UserService,
              private alertController: AlertController,
              private modalController: ModalController,
              private routerOutlet: IonRouterOutlet) {
  }

  ngOnInit() {
    this.loadUser();
    this.loadAccounts();
  }

  async editAccountname(key: string) {
    const serviceName = this.accounts.get(key).name;
    const alert = await this.alertController.create({
      header: serviceName,
      buttons: [
        {
          text: 'Abbrechen',
          role: 'cancel'
        },
        {
          text: 'Speichern',
          role: 'save',
        }
      ],
      inputs: [
        {
          placeholder: serviceName + ' benutzername',
          min: 3,
          max: 30,
          name: 'username'
        }
      ]
    });

    await alert.present();

    await alert.onDidDismiss().then(async (res) => {
      if (res.data && res.data.values.username && res.role === 'save') {
        this.userService.updateAccount(key, res.data.values.username).then(acc => {
          this.accounts.get(key).username = res.data.values.username;
        });
      }
    });
  }

  openContactRequests() {

  }

  async openEditProfile() {
    const modal = await this.modalController.create({
      component: EditUserProfileComponent,
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl,
      componentProps: {
        user: this.user
      }
    });

    await modal.present();
  }


  async openSettings() {
    const modal = await this.modalController.create({
      component: SettingsComponent,
      initialBreakpoint: 0.3,
      breakpoints: [0.3, 0.85]
    });

    await modal.present();
  }

  private loadUser() {
    this.baseService.userSubject.subscribe(user => {
      if (user) {
        this.user = user;
      }
    });
  }

  private loadAccounts() {
    this.userService.getAccounts().pipe(first()).subscribe((doc: DocumentSnapshot<any>) => {
      if (doc.data()) {
        Object.keys(doc.data()).forEach(key => {
          this.accounts.get(key).username = doc.data()[key];
        });
      }
    });
  }
}
