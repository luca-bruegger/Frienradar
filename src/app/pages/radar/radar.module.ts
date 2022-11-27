import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RadarPage } from './radar.page';

import { RadarPageRoutingModule } from './radar-routing.module';
import { RadarDisplayComponent } from '../../component/radar-display/radar-display.component';
import { ProfilePageModule } from '../profile/profile.module';
import { GoogleMapsModule } from '@angular/google-maps';
import { SharedModule } from '../../shared.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RadarPageRoutingModule,
    ProfilePageModule,
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
