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

  resetData: {
    userId: string;
    secret: string;
    expire: string;
  } = null;

  resetInProgress: boolean;
  isReset: boolean;
  strength: number;

  constructor(private modalController: ModalController,
              private store: Store,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params && params.userId && params.secret && params.expire) {
        this.checkIfResetIsExpired(params.expire);
        this.resetData = {
          userId: params.userId,
          secret: params.secret,
          expire: params.expire
        };
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

  sendResetEmail() {
    if (this.emailFormControl.invalid) {
      this.emailFormControl.markAsTouched();
      return;
    }

    this.resetInProgress = true;

    this.store.dispatch(new Account.SendResetEmail(this.emailFormControl.value)).subscribe(async data => {
      this.resetInProgress = false;
      this.dismiss();
    });
  }

  resetPassword() {
    if (this.resetPasswordFromGroup.invalid) {
      this.resetPasswordFromGroup.markAllAsTouched();
      return;
    }

    this.resetInProgress = true;

    const data = {
      password: this.resetPasswordFromGroup.get('password').value,
      confirmPassword: this.resetPasswordFromGroup.get('confirmPassword').value,
      userId: this.resetData.userId,
      secret: this.resetData.secret
    };

    this.store.dispatch(new Account.ResetPassword(data)).subscribe(async () => {
      this.resetInProgress = false;
    });
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

  private checkIfResetIsExpired(expire: any) {
    const recoveryDate = new Date(expire);
    const recoveryDateOneHourLater = new Date(recoveryDate.getTime() + 60 * 60 * 1000);
    const currentDate = new Date();

    if (recoveryDateOneHourLater.getTime() - currentDate.getTime() < 0) {
      // expired action
      return;
    }
  }
}
