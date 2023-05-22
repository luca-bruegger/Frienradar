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
  accountPresets = AccountPresets.set;
  searchBarValue = '';

  accountsFormGroup: FormGroup = this.formBuilder.group({});
  accountsData: AccountData[] = [];

  constructor(private store: Store,
              private formBuilder: FormBuilder,
              private loadingController: LoadingController,
              private alertController: AlertController,
              private navController: NavController) {
  }

  get userAccounts() {
    return this.store.selectSnapshot(SocialAccountsState.all);
  }

  ngOnInit() {
    this.accountsData = Object.assign([], this.store.selectSnapshot(AccountState.accountsData));
    this.generateFormGroup();
  }

  createNewSocialAccount() {
    this.navController.navigateForward('/tabs/social-accounts/create');
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
