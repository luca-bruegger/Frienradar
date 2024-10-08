import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Account, GlobalActions } from '../../store';
import { Store } from '@ngxs/store';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Path } from '../../helper/path';
import { AccountValidation } from '../../validation/account-validation';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent implements OnInit {
  formMessages = AccountValidation.formMessages;
  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')
  ]);

  resetPasswordFromGroup = new FormGroup({
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(100),
        Validators.pattern('((?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{8,})')
      ]),
      confirmPassword: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(100)
      ]),
    },
    {
      validators: [this.passwordMatchValidator]
    });

  resetInProgress: boolean;
  resetPasswordToken: string;
  isReset: boolean;
  strength: number;

  constructor(private modalController: ModalController,
              private store: Store,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params && params.reset_password_token) {
        this.resetPasswordToken = params.reset_password_token;
        this.isReset = true;
      } else {
        this.isReset = false;
      }
    });
  }

  dismiss() {
    this.modalController.dismiss();
    this.store.dispatch(new GlobalActions.Redirect({
      path: Path.login,
      forward: false,
      navigateRoot: false
    }));
  }

  async sendResetEmail() {
    if (this.emailFormControl.invalid) {
      this.emailFormControl.markAsTouched();
      return;
    }

    this.resetInProgress = true;
    await this.store.dispatch(new Account.SendResetEmail({
      email: this.emailFormControl.value,
      modalController: this.modalController
    })).toPromise();
    this.resetInProgress = false;
  }

  async resetPassword() {
    if (this.resetPasswordFromGroup.invalid) {
      this.resetPasswordFromGroup.markAllAsTouched();
      return;
    }

    this.resetInProgress = true;

    const data = {
      password: this.resetPasswordFromGroup.get('password').value,
      passwordConfirmation: this.resetPasswordFromGroup.get('confirmPassword').value,
      resetPasswordToken: this.resetPasswordToken
    };
    await this.store.dispatch(new Account.ResetPassword(data)).toPromise();
    this.resetInProgress = false;
  }

  private passwordMatchValidator(form: FormGroup) {
    if (form.get('password').value !== form.get('confirmPassword').value) {
      form.get('confirmPassword').setErrors({passwordConfirmationError: true});
      return {
        passwordConfirmationError: true
      };
    }
    form.get('confirmPassword').setErrors(null);
    return null;
  }
}
