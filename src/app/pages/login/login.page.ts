import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { AccountValidation } from '../../core/validation/account-validation';
import { Account } from "../../store";
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  selectedLoginType = LoginType.login.toString();
  isRegister = false;

  formGroup = AccountValidation.loginFormGroup;
  formMessages = AccountValidation.formMessages;

  strength = 0;

  loginInProgress = false;

  constructor(private store: Store) {}

  changeLoginType(isRegister: boolean) {
    const nameControl = this.formGroup.get('name');
    const profilePictureControl = this.formGroup.get('profilePicture');

    if (isRegister) {
      AccountValidation.setLoginValidationActive(false);
    } else {
      AccountValidation.setLoginValidationActive(true);
    }

    this.formGroup.reset()
    nameControl.updateValueAndValidity();
    profilePictureControl.updateValueAndValidity();
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
      })
    } else {
      this.store.dispatch(new Account.Login(this.formGroup.value)).subscribe(data => {
        this.loginInProgress = false;
      })
    }
  }
}

export enum LoginType {
  login,
  register
}
