import { Component, OnInit } from '@angular/core';
import { AlertController, IonRouterOutlet, MenuController, ModalController } from '@ionic/angular';
import { EditUserProfileComponent } from '../../component/edit-user-profile/edit-user-profile.component';
import { Select, Store } from '@ngxs/store';
import { Account, AccountState } from '../../store';
import { Account as AccountModel } from '../../model/account';
import { Observable } from 'rxjs';
import { SettingsComponent } from '../../component/element/settings/settings.component';
import { Picture } from '../../helper/picture';
import { first } from 'rxjs/operators';


@Component({
  selector: 'app-profile',
  templateUrl: 'profile.page.html',
  styleUrls: ['profile.page.scss'],
})
export class ProfilePage implements OnInit{
  @Select(AccountState.user) user$: Observable<Partial<AccountModel.User>>;
  currentCacheBreaker = Picture.cacheBreaker();

  constructor(private alertController: AlertController,
              private modalController: ModalController,
              private menuController: MenuController,
              private routerOutlet: IonRouterOutlet,
              private store: Store) {
  }

  async ngOnInit() {
    await this.openEditProfile();
  }

  async openEditProfile() {
    const user = this.store.selectSnapshot(AccountState.user);

    const modal = await this.modalController.create({
      component: EditUserProfileComponent,
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl,
      componentProps: {
        user
      }
    });

    modal.onDidDismiss().then(event => {
      if (event.data) {
        const data = event.data;
        const updateSet: Partial<AccountModel.User> = {};

        Object.keys(data).forEach(key => {
          if (data[key] !== user[key]) {
            updateSet[key] = data[key];
          }
        });

        if (updateSet === {}) {return;}
        this.store.dispatch(new Account.Update(updateSet)).pipe(first()).subscribe(() => {
          this.currentCacheBreaker = Picture.cacheBreaker();
        });
      }
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
}
