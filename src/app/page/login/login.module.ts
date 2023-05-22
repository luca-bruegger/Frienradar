import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoginPageRoutingModule } from './login-routing.module';

import { LoginPage } from './login.page';
import { PasswordStrengthMeterModule } from 'angular-password-strength-meter';
import { ResetPasswordComponent } from '../../component/reset-password/reset-password.component';
import { ProfilePictureSelectComponent } from '../../component/element/profile-picture-select/profile-picture-select.component';
import { AdditionalLoginDataComponent } from '../../component/additional-login-data/additional-login-data.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { SharedModule } from '../../shared.module';
import { TranslocoRootModule } from '../../transloco-root.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoginPageRoutingModule,
    ReactiveFormsModule,
    PasswordStrengthMeterModule.forRoot(),
    ImageCropperModule,
    SharedModule,
    TranslocoRootModule
  ],
  declarations: [
    LoginPage,
    ProfilePictureSelectComponent,
    ResetPasswordComponent,
    AdditionalLoginDataComponent
  ],
  exports: [
    ProfilePictureSelectComponent
  ]
})
export class LoginPageModule {}
