import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormControl, Validators } from '@angular/forms';
import { AccountValidation } from '../../../validation/account-validation';
import { SocialAccounts, SocialAccountsState } from '../../../store';
import { Store } from '@ngxs/store';
import { AppService } from '../../../service/app.service';

@Component({
  selector: 'app-edit-social-account',
  templateUrl: './edit-social-account.component.html',
  styleUrls: ['./edit-social-account.component.scss'],
})
export class EditSocialAccountComponent implements OnInit {
  @Input() accountPreset;
  @Input() providedAccount = null;
  @Input() title = 'Account bearbeiten';
  usernameFormControl = null;
  currentUsername = null;
  usernameMessages = AccountValidation.socialAccountUsernameMessages;

  constructor(private modalController: ModalController,
              private store: Store,
              private appService: AppService) { }

  ngOnInit() {
    this.currentUsername = this.providedAccount.username;
    this.usernameFormControl = new FormControl(this.providedAccount.username, [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(30),
      Validators.pattern('^\\S*$')
    ]);
  }

  async closeModal() {
    await this.modalController.dismiss();
  }

  async updateUsername() {
    if (this.usernameFormControl.invalid) {
      this.usernameFormControl.markAsTouched();
      return;
    }

    const spinner = await this.appService.createLoadingSpinner();

    await this.store.dispatch(new SocialAccounts.Update({
      id: this.providedAccount.id,
      username: this.usernameFormControl.value
    })).toPromise();

    await spinner.dismiss();

    const updatedAccount = this.store.selectSnapshot(SocialAccountsState.all).find(account => account.id === this.providedAccount.id);
    const hasUpdated = updatedAccount.username === this.usernameFormControl.value;
    this.currentUsername = this.usernameFormControl.value;

    if (hasUpdated) {
      await this.modalController.dismiss();
    }
  }
}
