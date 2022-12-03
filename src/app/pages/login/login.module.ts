import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoginPageRoutingModule } from './login-routing.module';

import { LoginPage } from './login.page';
import { PasswordStrengthMeterModule } from 'angular-password-strength-meter';
import { ProfilePictureSelectComponent } from '../../component/profile-picture-select/profile-picture-select.component';
import { ResetPasswordComponent } from '../../component/reset-password/reset-password.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoginPageRoutingModule,
    ReactiveFormsModule,
    PasswordStrengthMeterModule.forRoot()
  ],
  declarations: [
    LoginPage,
    ProfilePictureSelectComponent,
    ResetPasswordComponent
  ],
  exports: [
    ProfilePictureSelectComponent
  ]
})
export class LoginPageModule {}
