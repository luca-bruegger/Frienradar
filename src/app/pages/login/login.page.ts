import { Component } from '@angular/core';
import { Store } from '@ngxs/store';
import { UserService } from '../../core/appwrite/user.service';
import { AccountValidation } from '../../core/validation/account-validation';
import { Account } from "../../store";

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  selectedLoginType = LoginType.login.toString();

  formGroup = AccountValidation.loginFormGroup;
  formMessages = AccountValidation.formMessages;

  strength = 0;

  constructor(private store: Store) {}

  get isRegister() {
    return this.selectedLoginType === LoginType.register.toString();
  }

  segmentChanged($event: any) {
    const type = $event.detail.value;
    const nameControl = this.formGroup.get('name');
    const profilePictureControl = this.formGroup.get('profilePicture');

    if (type === 'register') {
      AccountValidation.setLoginValidationActive(false);
    } else {
      AccountValidation.setLoginValidationActive(true);
    }

    this.formGroup.reset()
    nameControl.updateValueAndValidity();
    profilePictureControl.updateValueAndValidity();
    this.selectedLoginType = type;
  }

  signInUser() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }
    if (this.isRegister) {
      this.store.dispatch(new Account.Signup(this.formGroup.value));
    } else {
      this.store.dispatch(new Account.Login(this.formGroup.value))
    }
  }
}

export enum LoginType {
  login,
  register
}
