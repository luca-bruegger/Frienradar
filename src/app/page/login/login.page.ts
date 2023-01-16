import { Component, OnDestroy } from '@angular/core';
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
export class LoginPage implements OnDestroy {
  isRegister = true;

  formGroup = AccountValidation.loginFormGroup;
  formMessages = AccountValidation.formMessages;

  strength = 0;

  loginInProgress = false;
  profilePicture = null;

  constructor(private store: Store,
              private modalController: ModalController) {
  }

  ngOnDestroy() {
    this.formGroup.reset();
    this.loginInProgress = false;
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

  async signInUser() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    this.loginInProgress = true;

    if (this.isRegister) {
      await this.store.dispatch(new Account.Signup(this.formGroup.value)).toPromise();
    } else {
      await this.store.dispatch(new Account.Login(this.formGroup.value)).toPromise();
    }

    this.loginInProgress = false;
  }

  async resetPassword() {
    const modal = await this.modalController.create({
      component: ResetPasswordComponent
    });

    await modal.present();
  }

  setProfilePicture(profilePicture: string) {
    this.profilePicture = profilePicture;
    this.formGroup.get('profilePicture').setValue(profilePicture);
  }

  displayFormErrorByName(name: string, validationType: string) {
    return this.formGroup.get(name).hasError(validationType) && (this.formGroup.get(name).dirty || this.formGroup.get(name).touched);
  }
}
