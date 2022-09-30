import { Component } from '@angular/core';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { AlertController, IonRouterOutlet, ModalController } from '@ionic/angular';
import { SettingsComponent } from '../../component/settings/settings.component';
import { EditUserProfileComponent } from "../../component/edit-user-profile/edit-user-profile.component";
import { Select, Store } from "@ngxs/store";
import { Account, AccountState } from "../../store";
import { Observable } from 'rxjs';
import User from 'src/app/model/user';


@Component({
  selector: 'app-profile',
  templateUrl: 'profile.page.html',
  styleUrls: ['profile.page.scss'],
})
export class ProfilePage {
  @Select(AccountState.user) user$: Observable<Partial<User>>;

  profilePicture = 'assets/images/blank.png'

  constructor(private imagePicker: ImagePicker,
              private alertController: AlertController,
              private modalController: ModalController,
              private routerOutlet: IonRouterOutlet,
              private store: Store) {
    this.store.dispatch(new Account.Fetch)
  }

  // async editAccountname(key: string) {
  //   const serviceName = this.accounts.get(key).name;
  //   const alert = await this.alertController.create({
  //     header: serviceName,
  //     buttons: [
  //       {
  //         text: 'Abbrechen',
  //         role: 'cancel'
  //       },
  //       {
  //         text: 'Speichern',
  //         role: 'save',
  //       }
  //     ],
  //     inputs: [
  //       {
  //         placeholder: serviceName + ' benutzername',
  //         min: 3,
  //         max: 30,
  //         name: 'username'
  //       }
  //     ]
  //   });
  //
  //   await alert.present();
  //
  //   await alert.onDidDismiss().then(async (res) => {
  //     if (res.data && res.data.values.username && res.role === 'save') {
  //     }
  //   });
  // }

  openContactRequests() {

  }

  async openEditProfile() {
    const user = this.store.selectSnapshot(AccountState.user)
    const userData = {
      name: user.name,
      email: user.email,
      description: user.description,
      profilePicture: user.profilePicture
    }

    const modal = await this.modalController.create({
      component: EditUserProfileComponent,
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl,
      componentProps: {
        userData
      }
    });

    modal.onDidDismiss().then(event => {
      const data = event.data;
      let updateSet: Partial<User> = {};

      Object.keys(data).forEach(key => {
        if (data[key] !== userData[key]) {
          updateSet[key] = data[key]
        }
      })

      if (updateSet === {}) return;
      this.store.dispatch(new Account.Update(updateSet))
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
}
