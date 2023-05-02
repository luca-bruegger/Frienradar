import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SocialAccountsPage } from './social-accounts.page';
import { SocialAccountsRoutingModule } from './social-accounts-routing.module';
import { SharedModule } from '../../shared.module';
import {
  CreateSocialAccountComponent
} from '../../component/social-account/create-social-account/create-social-account.component';
import {
  EditSocialAccountComponent
} from '../../component/social-account/edit-social-account/edit-social-account.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SocialAccountsRoutingModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [
    SocialAccountsPage,
    CreateSocialAccountComponent,
    EditSocialAccountComponent
  ]
})
export class SocialAccountsPageModule {}
