import { Component } from '@angular/core';
import { Store } from '@ngxs/store';
import { AccountValidation } from '../../core/validation/account-validation';
import { Account } from '../../store';
import { ModalController } from '@ionic/angular';
import { ResetPasswordComponent } from '../../component/reset-password/reset-password.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  isRegister = true;

  formGroup = AccountValidation.loginFormGroup;
  formMessages = AccountValidation.formMessages;

  strength = 0;

  loginInProgress = false;

  constructor(private store: Store,
              private modalController: ModalController) {
  }

  changeLoginType(isRegister: boolean) {
    if (isRegister) {
      this.formGroup.addControl('name', AccountValidation.nameControl);
      this.formGroup.addControl('profilePicture', AccountValidation.profilePictureControl);
      this.formGroup.addControl('acceptTerms', AccountValidation.acceptTermsControl);
    } else {
      this.formGroup.removeControl('name');
      this.formGroup.removeControl('profilePicture');
      this.formGroup.removeControl('acceptTerms');
    }

    this.isRegister = isRegister;
  }

  signInUser() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    this.loginInProgress = true;

    if (this.isRegister) {
      this.store.dispatch(new Account.Signup(this.formGroup.value)).subscribe(data => {
        this.loginInProgress = false;
      });
    } else {
      this.store.dispatch(new Account.Login(this.formGroup.value)).subscribe(data => {
        this.loginInProgress = false;
      });
    }
  }

  async resetPassword() {
    const modal = await this.modalController.create({
      component: ResetPasswordComponent
    });

    await modal.present();
  }

  openTermsConditions() {
    window.open('https://frienradar.com/terms-conditions/', '_system');
  }
}
