import { Component, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngxs/store';
import { Account, AccountState, GlobalActions } from '../../store';
import { AlertController, ModalController, PopoverController } from '@ionic/angular';
import { SettingsComponent } from '../element/settings/settings.component';
import { EditUserProfileComponent } from '../edit-user-profile/edit-user-profile.component';
import { ActionCableService } from '../../service/action-cable.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent  {
  @ViewChild('popover', {static: true}) popover: HTMLIonPopoverElement;
  resetSent = false;

  constructor(private alertController: AlertController,
              private modalController: ModalController,
              private store: Store,
              private popoverController: PopoverController,
              private actionCableService: ActionCableService) {
  }

  get user(): any {
    return this.store.selectSnapshot(AccountState.user);
  }

  get connectionStatus() {
    return this.actionCableService.isCableConnected;
  }

  async openEditProfile() {
    const modal = await this.modalController.create({
      component: EditUserProfileComponent,
    });

    await modal.present();
  }


  async openSettings() {
    const modal = await this.modalController.create({
      component: SettingsComponent,
      initialBreakpoint: 0.4,
      breakpoints: [0.4]
    });

    await modal.present();
  }

  async openChangePassword() {
    if (this.resetSent) {
      this.store.dispatch(new GlobalActions.ShowToast({
        message: 'Email wurde bereits gesendet. Bitte überprüfe deinen Posteingang.',
        color: 'danger'
      }));
      return;
    }

    const alert = await this.alertController.create({
      header: 'Passwort ändern',
      buttons: [
        {
          text: 'Abbrechen',
          role: 'cancel'
        },
        {
          text: 'Email senden',
          handler: async () => {
            await this.store.dispatch(new Account.SendResetEmail({
              email: this.user.email,
              modalController: this.modalController
            })).toPromise();
            this.resetSent = true;
          }
        }
      ]
    });

    await alert.present();
  }

  async signOut() {
    await this.store.dispatch(new Account.Logout()).toPromise();
    await this.popover.dismiss();
  }

  changeDarkMode(event) {
    document.body.classList.toggle('dark', event.detail.checked);
    document.body.classList.toggle('light', !event.detail.checked);
  }
}
