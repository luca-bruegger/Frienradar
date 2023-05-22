import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { FormControl } from '@angular/forms';
import { SocialAccounts, SocialAccountsState } from '../../store';
import { Store } from '@ngxs/store';
import { EditSocialAccountComponent } from './edit-social-account/edit-social-account.component';
import { AccountValidation } from '../../validation/account-validation';
import { TranslocoService } from '@ngneat/transloco';

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

  constructor(private alertController: AlertController,
              private store: Store,
              private modalController: ModalController,
              private translocoService: TranslocoService) {
  }

  get socialAccountsCount() {
    return this.store.selectSnapshot(SocialAccountsState.count);
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
          text: this.translocoService.translate('general.open'),
          handler: () => {
            this.openExternalLink();
          }
        },
        {
          text: this.translocoService.translate('general.edit'),
          handler: () => {
            this.editAccount();
          }
        },
        {
          text: this.translocoService.translate('general.delete'),
          role: 'destructive',
          handler: async () => {
            if (this.socialAccountsCount === 1) {
              const lastAccountAlert = await this.alertController.create({
                header: this.translocoService.translate('social-account.last-account'),
                message: this.translocoService.translate('social-account.warning'),
                buttons: [this.translocoService.translate('general.ok')]
              });

              await lastAccountAlert.present();
              return;
            }

            const deleteAlert = await this.alertController.create({
              header: this.translocoService.translate('social-account.delete-confirmation'),
              subHeader: this.translocoService.translate('social-account.delete-warning'),
              buttons: [
                {
                  text: this.translocoService.translate('social-account.permanently-delete', { name: this.accountPreset.name }),
                  role: 'destructive',
                  handler: () => {
                    this.deleteAccount();
                  }
                },
                {
                  text: this.translocoService.translate('general.cancel'),
                  role: 'cancel',
                }
              ]
            });

            await deleteAlert.present();
          }
        },
        {
          text: this.translocoService.translate('general.cancel'),
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
        title: this.translocoService.translate('social-account.edit', { name: this.accountPreset.name })
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
