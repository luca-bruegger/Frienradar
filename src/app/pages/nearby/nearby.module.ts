import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NearbyPageRoutingModule } from './nearby-routing.module';

import { NearbyPage } from './nearby.page';
import { NearbyUserElementComponent } from '../../component/nearby-user-element/nearby-user-element.component';
import { SharedModule } from '../../shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NearbyPageRoutingModule,
    SharedModule
  ],
  declarations: [NearbyPage, NearbyUserElementComponent]
})
export class NearbyPageModule {}
