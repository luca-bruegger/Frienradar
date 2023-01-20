import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InterestPageRoutingModule } from './accounts-routing.module';

import { AccountsPage } from './accounts.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InterestPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [AccountsPage]
})
export class AccountsPageModule {}
