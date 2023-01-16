import { Component, OnInit } from '@angular/core';
import { AccountPresets } from '../../helper/accountPresets';
import { Store } from '@ngxs/store';
import { AccountState } from '../../store';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.page.html',
  styleUrls: ['./accounts.page.scss'],
})
export class AccountsPage implements OnInit {

  isLoading = false;
  accountPresets = AccountPresets.set;
  selectedPresetName = '';
  accountNameFilter = '';

  constructor(private store: Store) {
  }

  get filteredAccounts() {
    return this.accountPresets.filter(preset => preset.key.toLowerCase().includes(this.accountNameFilter.toLowerCase()));
  }

  ngOnInit() {
    const user = this.store.selectSnapshot(AccountState.user);
  }

  editAccountname(key) {


  }

  addAccount(account) {
    console.log(event);
    this.selectedPresetName = account.key;
  }

  isSelectedItem(key) {
    return this.selectedPresetName === key;
  }
}
