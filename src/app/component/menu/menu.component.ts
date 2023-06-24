import { Component, ViewChild } from '@angular/core';
import { Store } from '@ngxs/store';
import { Account, AccountState } from '../../store';
import { AlertController, ModalController, PopoverController } from '@ionic/angular';
import { EditUserProfileComponent } from '../edit-user-profile/edit-user-profile.component';
import { ActionCableService } from '../../service/action-cable.service';
import { TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent  {
  @ViewChild('popover', {static: true}) popover: HTMLIonPopoverElement;
  selectedLanguage = this.translocoService.getActiveLang();

  constructor(private alertController: AlertController,
              private modalController: ModalController,
              private store: Store,
              private popoverController: PopoverController,
              private actionCableService: ActionCableService,
              private translocoService: TranslocoService) {
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

  async signOut() {
    await this.store.dispatch(new Account.Logout()).toPromise();
    await this.popover.dismiss();
    window.location.reload();
  }

  changeDarkMode(event) {
    document.body.classList.toggle('dark', event.detail.checked);
    document.body.classList.toggle('light', !event.detail.checked);
  }

  updateLanguage(event) {
    const lang = event.detail.value;
    this.translocoService.setActiveLang(lang);
  }
}
