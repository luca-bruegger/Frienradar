import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Account, AccountState, GlobalActions } from '../../store';
import { Store } from '@ngxs/store';
import { AccountValidation } from '../../validation/account-validation';

@Component({
  selector: 'app-edit-user-profile',
  templateUrl: './edit-user-profile.component.html',
  styleUrls: ['./edit-user-profile.component.scss'],
})
export class EditUserProfileComponent implements OnInit {
  formGroup = AccountValidation.editProfileFormGroup;
  formMessages = AccountValidation.formMessages;
  updatedProfilePicture: Blob = null;

  constructor(private modalController: ModalController,
              private store: Store) {
  }

  ngOnInit() {
    this.setInitialValues();
  }

  updateProfilePicture($event: Blob) {
    this.updatedProfilePicture = $event;
    this.formGroup.get('profilePicture').markAsTouched();
  }

  async closeModalWithSave(isSave: boolean) {
    if (!isSave) {
      await this.modalController.dismiss();
    }

    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    let user = this.store.selectSnapshot(AccountState.user) as any;
    let userData = { name: user.name, description: user.description, username: user.username };

    let data: any = {};

    // Only set changed values
    Object.keys(userData).forEach((key) => {
      const attrValue = this.formGroup.get(key).value;
      if (attrValue !== userData[key]) {
        data[key] = attrValue;
      }
    });

    if (this.updatedProfilePicture) {
      data.profilePicture = this.updatedProfilePicture;
    }

    await this.store.dispatch(new Account.UpdateWithFormData({
      options: data
    })).toPromise();

    // Close only if user has been updated
    user = this.store.selectSnapshot(AccountState.user) as any;
    userData = { name: user.name, description: user.description, username: user.username };

    for (const key of Object.keys(userData)) {
      if (!data.hasOwnProperty(key)) {
        data[key] = userData[key];
      }
    }

    data = { name: data.name, description: data.description, username: data.username };
    if (JSON.stringify(userData) === JSON.stringify(data) || this.updatedProfilePicture) {
      await this.modalController.dismiss();
      this.store.dispatch(new GlobalActions.ShowToast({
        message: 'Benutzer aktualisiert.',
        color: 'success'
      }));
    }
  }

  private setInitialValues() {
    this.store.select(AccountState.user).subscribe(user => {
      this.formGroup.get('name').patchValue(user.name);
      this.formGroup.get('email').patchValue(user.email);
      this.formGroup.get('username').patchValue(user.username);
      this.formGroup.get('profilePicture').patchValue(user.profile_picture);
      //this.formGroup.get('description').patchValue(user.description);
    });
  }
}
