import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Account, AccountState } from '../../store';
import { AlertController, ModalController } from '@ionic/angular';
import { SettingsComponent } from '../element/settings/settings.component';
import { EditUserProfileComponent } from '../edit-user-profile/edit-user-profile.component';
import { ActionCableService } from '../../service/action-cable.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {

  get user() {
    return this.store.selectSnapshot(AccountState.user);
  }

  get connectionStatus() {
    return this.actionCableService.isCableConnected;
  }

  constructor(private alertController: AlertController,
              private modalController: ModalController,
              private store: Store,
              private actionCableService: ActionCableService) {}

  async ngOnInit() {
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

  openChangePassword() {

  }

  async signOut() {
    await this.store.dispatch(new Account.Logout()).toPromise();
  }
}
