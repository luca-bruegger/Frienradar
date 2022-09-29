import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AccountValidation } from '../../core/validation/account-validation';

@Component({
  selector: 'app-edit-user-profile',
  templateUrl: './edit-user-profile.component.html',
  styleUrls: ['./edit-user-profile.component.scss'],
})
export class EditUserProfileComponent implements OnInit {
  @Input() userData: any;

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
    await this.modalController.dismiss(this.formGroup.value);
  }

  private setInitialValues() {
    Object.keys(this.formGroup.controls).forEach(name => {
      this.formGroup.get(name).patchValue(this.userData[name])
    })
  }
}
