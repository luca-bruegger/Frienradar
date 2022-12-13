import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProfilePage } from './profile.page';

import { ProfilePageRoutingModule } from './profile-routing.module';
import { EditUserProfileComponent } from '../../component/edit-user-profile/edit-user-profile.component';
import { LoginPageModule } from '../login/login.module';
import { SettingsComponent } from '../../component/element/settings/settings.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfilePageRoutingModule,
    LoginPageModule,
    ReactiveFormsModule
  ],
  exports: [],
  declarations: [ProfilePage, EditUserProfileComponent, SettingsComponent]
})
export class ProfilePageModule {}
