import { Component } from '@angular/core';
import { UserService } from '../../core/service/user.service';
import { AccountValidation } from '../../core/validation/account-validation';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  selectedLoginType = LoginType.login.toString();

  formGroup = AccountValidation.formGroup;
  formMessages = AccountValidation.formMessages;

  strength = 0;

  constructor(private userService: UserService) {}

  get isRegister() {
    return this.selectedLoginType === LoginType.register.toString();
  }

  segmentChanged($event: any) {
    const type = $event.detail.value;
    const control = this.formGroup.get('name');

    if (type === 'register') {
      AccountValidation.setLoginValidationActive(false);
    } else {
      AccountValidation.setLoginValidationActive(true);
    }

    control.updateValueAndValidity();
    this.selectedLoginType = type;
  }

  signInUser() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    if (this.isRegister) {
      this.userService.createUser(this.formGroup.value);
    } else {
      this.userService.signInUser(this.formGroup.value);
    }
  }
}

export enum LoginType {
  login,
  register
}
