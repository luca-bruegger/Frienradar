import { Component, OnInit } from '@angular/core';
import { AccountPresets } from '../../helper/accountPresets';
import { Store } from '@ngxs/store';
import { AccountState, SocialAccounts, SocialAccountsState } from '../../store';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AccountData } from '../../model/accountData';
import { AlertController, LoadingController, NavController } from '@ionic/angular';

@Component({
  selector: 'app-social-accounts',
  templateUrl: './social-accounts.page.html',
  styleUrls: ['./social-accounts.page.scss']
})
export class SocialAccountsPage implements OnInit {
  isLoading = false;
  accountPresets = AccountPresets.set;
  selectedPresetName = '';
  searchBarValue = '';

  accountsFormGroup: FormGroup = this.formBuilder.group({});
  accountsData: AccountData[] = [];
  isChangingAccount = false;

  constructor(private store: Store,
              private formBuilder: FormBuilder,
              private loadingController: LoadingController,
              private alertController: AlertController,
              private navController: NavController) {
  }

  get searchedAccounts() {
    return this.accountPresets.filter(preset => preset.key.toLowerCase().includes(this.searchBarValue.toLowerCase())).filter(preset => {
      const i = this.accountsData.findIndex(e => e.key === preset.key);
      return i === -1;
    });
  }

  get userAccounts() {
    return this.store.selectSnapshot(SocialAccountsState.all);
  }

  get connectedAccounts() {
    return this.accountPresets.filter(preset => {
      const i = this.accountsData.findIndex(e => e.key === preset.key);
      return i > -1;
    });
  }

  ngOnInit() {
    this.accountsData = Object.assign([], this.store.selectSnapshot(AccountState.accountsData));
    this.generateFormGroup();
  }

  editExistingAccountData(accountData) {

  }

  async addAccount(account) {
    this.isChangingAccount = true;

    const spinner = await this.loadingController.create({
      message: 'Account wird hinzugefügt...',
      spinner: 'crescent',
      showBackdrop: true
    });

    await spinner.present();

    this.accountsData.push({
      key: account.key,
      username: this.accountsFormGroup.get(account.key).value
    } as AccountData);

    //await this.store.dispatch(new SocialAccounts.UpdateAccountsData({accountsData: this.accountsData}));
    this.isChangingAccount = false;
    await spinner.dismiss();
    this.selectedPresetName = '';
  }

  isSelectedItem(key) {
    return this.selectedPresetName === key;
  }

  async editAccountData(accountPreset) {
    this.isChangingAccount = true;

    const spinner = await this.loadingController.create({
      message: 'Account wird gespeichert...',
      spinner: 'crescent',
      showBackdrop: true
    });

    await spinner.present();

    const i = this.accountsData.findIndex(e => e.key === accountPreset.key);

    this.accountsData[i] = {
      key: accountPreset.key,
      username: this.accountsFormGroup.get(accountPreset.key).value
    } as AccountData;

    //await this.store.dispatch(new Account.UpdateAccountsData({accountsData: this.accountsData}));
    this.isChangingAccount = false;
    await spinner.dismiss();
    this.selectedPresetName = '';
  }

  connectedAccountsAvailable() {
    return this.connectedAccounts.length > 0;
  }

  quitSelection() {
    this.selectedPresetName = '';
  }

  selectAccount(accountPreset) {
    this.selectedPresetName = accountPreset.key;
  }

  async removeAccount(accountData) {
    const alert = await this.alertController.create({
      header: 'Warnung',
      subHeader: 'Account entfernen',
      message: 'Möchtest du den Account wirklich entfernen?',
      buttons: [
        {
          text: 'Abbrechen',
          role: 'cancel',
          handler: () => {
            alert.dismiss();
          },
        },
        {
          text: 'Entfernen',
          role: 'confirm',
          handler: () => {
            this.accountsData = this.accountsData.filter(e => e.key !== accountData.key);
            //this.store.dispatch(new Account.UpdateAccountsData({accountsData: this.accountsData}));
            this.selectedPresetName = '';
            this.accountsFormGroup.get(accountData.key).setValue('');
          },
        }],
    });

    await alert.present();
  }

  openExternalLink(param: any) {
    window.open(param, '_system');
  }

  createNewSocialAccount() {
    this.navController.navigateForward('/tabs/social-accounts/create');
  }

  openSocialAccountSettings() {

  }

  async refresh($event: any) {
    await this.store.dispatch(new SocialAccounts.Fetch()).toPromise();
    $event.target.complete();
  }

  private generateFormGroup() {
    this.accountPresets.forEach(preset => {
      const i = this.accountsData.findIndex(e => e.key === preset.key);
      const value = i > -1 ? this.accountsData[i].username : '';
      this.accountsFormGroup.addControl(preset.key, this.formBuilder.control(value, [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(30)
      ]));
    });
  }
}
