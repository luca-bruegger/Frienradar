import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RadarPage } from './radar.page';

import { RadarPageRoutingModule } from './radar-routing.module';
import { GoogleMapsModule } from '@angular/google-maps';
import { SharedModule } from '../../shared.module';
import { RadarDisplayComponent } from '../../component/element/radar-display/radar-display.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RadarPageRoutingModule,
    GoogleMapsModule,
    SharedModule
  ],
  declarations: [
    RadarPage,
    RadarDisplayComponent
  ],
  schemas: [
  ]

})
export class RadarPageModule {}
