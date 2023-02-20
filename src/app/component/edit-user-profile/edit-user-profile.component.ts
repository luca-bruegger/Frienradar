import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Picture } from '../../helper/picture';
import { AccountState } from '../../store';
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

  constructor(private modalController: ModalController,
              private store: Store) {
  }

  ngOnInit() {
    this.setInitialValues();
  }

  async closeModalWithSave(isSave: boolean) {
    if (!isSave) {
      await this.modalController.dismiss();
    }

    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }
    await this.modalController.dismiss({
      name: this.formGroup.get('name').value,
      email: this.formGroup.get('email').value,
      profilePicture: this.formGroup.get('profilePicture').value,
      description: this.formGroup.get('description').value
    });
  }

  private setInitialValues() {
    this.store.select(AccountState.user).subscribe(user => {
      console.log(user);
      this.formGroup.get('name').patchValue(user.name);
      this.formGroup.get('email').patchValue(user.email);
      this.formGroup.get('username').patchValue(user.username);
      this.formGroup.get('profilePicture').patchValue(Picture.profilePictureViewURL(user.$id, Picture.cacheBreaker()));
      this.formGroup.get('description').patchValue(user.description);
    });
  }
}
