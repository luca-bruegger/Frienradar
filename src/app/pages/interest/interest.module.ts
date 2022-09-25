import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InterestPageRoutingModule } from './interest-routing.module';

import { InterestPage } from './interest.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InterestPageRoutingModule
  ],
  declarations: [InterestPage]
})
export class InterestPageModule {}
