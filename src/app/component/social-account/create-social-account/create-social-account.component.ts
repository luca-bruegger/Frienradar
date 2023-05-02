import { Component, OnInit, ViewChild } from '@angular/core';
import { AccountPresets } from '../../../helper/accountPresets';
import { IonModal } from '@ionic/angular';
import { SocialAccounts, SocialAccountsState } from '../../../store';
import { Store } from '@ngxs/store';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-create-social-account',
  templateUrl: './create-social-account.component.html',
  styleUrls: ['./create-social-account.component.scss'],
})
export class CreateSocialAccountComponent implements OnInit {
  @ViewChild('modal', { static: true }) modal!: IonModal;
  searchbarValue = '';
  selectedService: any = null;

  usernameFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(30),
    Validators.pattern('^\\S*$')
  ]);

  get socialAccounts() {
    return this.store.selectSnapshot(SocialAccountsState.all);
  }

  constructor(private store: Store) { }

  ngOnInit() {
    this.selectedService = this.availablePresets()[0];
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

  availablePresets() {
    const unavailableProviders = this.socialAccounts.map(account => account.provider_key);
    return AccountPresets.set.filter(preset => !unavailableProviders.includes(preset.providerKey));
  }

  addAccount() {
    if (this.usernameFormControl.invalid) {
      this.usernameFormControl.markAsTouched();
      return;
    }

    this.store.dispatch(new SocialAccounts.Add({
      providerKey: this.selectedService.providerKey,
      username: this.usernameFormControl.value
    }));
  }
}
