import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RadarPage } from './radar.page';

import { RadarPageRoutingModule } from './radar-routing.module';
import { RadarDisplayComponent } from '../../component/radar-display/radar-display.component';
import { ProfilePageModule } from '../profile/profile.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RadarPageRoutingModule,
    ProfilePageModule
  ],
  declarations: [
    RadarPage,
    RadarDisplayComponent
  ]
})
export class RadarPageModule {}
