import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { FormControl } from '@angular/forms';
import { SocialAccounts, SocialAccountsState } from '../../store';
import { Store } from '@ngxs/store';
import { EditSocialAccountComponent } from './edit-social-account/edit-social-account.component';
import { AccountValidation } from '../../validation/account-validation';

@Component({
  selector: 'app-social-account',
  templateUrl: './social-account.component.html',
  styleUrls: ['./social-account.component.scss'],
})
export class SocialAccountComponent implements OnInit {
  @Input() accountPreset;
  @Input() providedAccount = null;
  @Input() usernameFormControl = new FormControl('');

  usernameMessages = AccountValidation.socialAccountUsernameMessages;

  get socialAccountsCount() {
    return this.store.selectSnapshot(SocialAccountsState.count);
  }

  constructor(private alertController: AlertController,
              private store: Store,
              private modalController: ModalController) {
  }

  ngOnInit() {
    if (this.providedAccount) {
      this.usernameFormControl.setValue('@' + this.providedAccount.username);
    }
  }

  async openAccountAlert() {
    const alert = await this.alertController.create({
      header: this.accountPreset.name,
      buttons: [
        {
          text: 'Öffnen',
          handler: () => {
            this.openExternalLink();
          }
        },
        {
          text: 'Bearbeiten',
          handler: () => {
            this.editAccount();
          }
        },
        {
          text: 'Löschen',
          role: 'destructive',
          handler: async () => {
            if (this.socialAccountsCount === 1) {
              const lastAccountAlert = await this.alertController.create({
                header: 'Letztes Konto',
                message: 'Du kannst nicht alle Konten löschen!',
                buttons: ['OK']
              });

              await lastAccountAlert.present();
              return;
            }

            const deleteAlert = await this.alertController.create({
              header: 'Wirklich löschen?',
              subHeader: 'Das kann nicht rückgängig gemacht werden!',
              buttons: [
                {
                  text: this.accountPreset.name + ' endgültig löschen',
                  role: 'destructive',
                  handler: () => {
                    this.deleteAccount();
                  }
                },
                {
                  text: 'Abbrechen',
                  role: 'cancel',
                }
              ]
            });

            await deleteAlert.present();
          }
        },
        {
          text: 'Abbrechen',
          role: 'cancel',
        },
      ]
    });

    await alert.present();
  }

  private async editAccount() {
    const modal = await this.modalController.create({
      component: EditSocialAccountComponent,
      componentProps: {
        accountPreset: this.accountPreset,
        providedAccount: this.providedAccount,
        title: this.accountPreset.name + ' bearbeiten'
      },
      presentingElement: document.querySelector('app-social-accounts')
    });

    await modal.present();
  }

  private openExternalLink() {
    window.open(this.accountPreset.profileUrl + this.usernameFormControl.value.substring(1), '_system');
  }

  private deleteAccount() {
    this.store.dispatch(new SocialAccounts.Delete({id: this.providedAccount.id}));
  }
}
