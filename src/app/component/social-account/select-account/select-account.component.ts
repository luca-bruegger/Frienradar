import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { SocialAccounts, SocialAccountsState } from '../../../store';
import { FormControl, Validators } from '@angular/forms';
import { Store } from '@ngxs/store';
import { AccountPresets } from '../../../helper/accountPresets';
import { IonModal } from '@ionic/angular';

@Component({
  selector: 'app-select-account',
  templateUrl: './select-account.component.html',
  styleUrls: ['./select-account.component.scss'],
})
export class SelectAccountComponent implements OnInit {
  @ViewChild('modal', { static: true }) modal!: IonModal;
  @Input() selectedService: any;
  @Input() withRedirect = true;
  searchbarValue = '';

  usernameFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(30),
    Validators.pattern('^\\S*$')
  ]);

  constructor(private store: Store) { }

  get socialAccounts() {
    return this.store.selectSnapshot(SocialAccountsState.all);
  }

  ngOnInit() {
    this.selectedService = this.availablePresets()[0];
  }

  addAccount() {
    if (this.usernameFormControl.invalid) {
      this.usernameFormControl.markAsTouched();
      return;
    }

    this.store.dispatch(new SocialAccounts.Add({
      providerKey: this.selectedService.providerKey,
      username: this.usernameFormControl.value,
      withRedirect: this.withRedirect
    }));
  }

  availablePresets() {
    const unavailableProviders = this.socialAccounts.map(account => account.provider_key);
    return AccountPresets.set.filter(preset => !unavailableProviders.includes(preset.providerKey));
  }

  async cancelChanges() {
    await this.modal.dismiss();
  }

  async selectService(service: any) {
    this.selectedService = service;
    await this.modal.dismiss();
  }

  searchbarInput($event: any) {
    this.searchbarValue = $event.target.value;
  }

  filteredPresets() {
    return this.availablePresets().filter(preset => preset.name.toLowerCase().includes(this.searchbarValue.toLowerCase()));
  }
}
