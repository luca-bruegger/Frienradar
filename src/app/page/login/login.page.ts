import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngxs/store';
import { Account } from '../../store';
import { IonInput, ModalController } from '@ionic/angular';
import { ResetPasswordComponent } from '../../component/reset-password/reset-password.component';
import { AccountValidation } from '../../validation/account-validation';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('emailInput', { static: true }) emailInput: IonInput;
  @ViewChild('passwordInput', { static: true }) passwordInput: IonInput;

  isRegister = false;

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

  ngOnInit() {
    this.profilePicture = null;
    this.changeLoginType(false);
  }

  async ngAfterViewInit() {
    await this.listenForIosAutofill();
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
    if (this.formGroup.invalid && environment.production) {
      this.formGroup.markAllAsTouched();
      return;
    }

    this.loginInProgress = true;
    if (this.isRegister) {
      await this.store.dispatch(new Account.Register({
        ...this.formGroup.value,
        registerLoading: this.loginInProgress
      })).toPromise();
    } else {
      await this.store.dispatch(new Account.Login({
        ...this.formGroup.value,
        loading: this.loginInProgress
      })).toPromise();
    }
    this.loginInProgress = false;
  }

  async resetPassword() {
    const modal = await this.modalController.create({
      component: ResetPasswordComponent
    });

    await modal.present();
  }

  setProfilePicture(profilePicture: Blob) {
    this.formGroup.get('profilePicture').setValue(profilePicture);
  }

  displayFormErrorByName(name: string, validationType: string) {
    if (!this.formGroup.contains(name)) {
      return;
    }

    const formcontrol = this.formGroup.get(name);
    return formcontrol.hasError(validationType) && (formcontrol.dirty || formcontrol.touched);
  }

  private async listenForIosAutofill() {
    const nativeEmailInput = await this.emailInput.getInputElement();
    const nativePasswordInput = await this.passwordInput.getInputElement();

    nativeEmailInput.addEventListener('change', (ev: Event) => {
      requestAnimationFrame(() => {
        this.formGroup.get('email').patchValue((ev.target as HTMLInputElement).value);
      });
    });

    nativePasswordInput.addEventListener('change', (ev: Event) => {
      requestAnimationFrame(() => {
        this.formGroup.get('password').patchValue((ev.target as HTMLInputElement).value);
      });
    });
  }
}
