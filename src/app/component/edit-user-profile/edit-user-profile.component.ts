import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AccountValidation } from '../../core/validation/account-validation';
import { Account as AccountModel } from '../../model/account';

@Component({
  selector: 'app-edit-user-profile',
  templateUrl: './edit-user-profile.component.html',
  styleUrls: ['./edit-user-profile.component.scss'],
})
export class EditUserProfileComponent implements OnInit {
  @Input() user: AccountModel.User;

  formGroup = AccountValidation.editProfileFormGroup;
  formMessages = AccountValidation.formMessages;

  constructor(private modalController: ModalController) {
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
      prefs: {
        description: this.formGroup.get('description').value
      }
    });
  }

  private setInitialValues() {
    this.formGroup.get('name').patchValue(this.user.name);
    this.formGroup.get('email').patchValue(this.user.email);
    this.formGroup.get('profilePicture').patchValue(this.user.profilePicture);
    this.formGroup.get('description').patchValue(this.user.prefs.description);
  }
}
