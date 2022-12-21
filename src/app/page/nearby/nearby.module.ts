import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NearbyPageRoutingModule } from './nearby-routing.module';

import { NearbyPage } from './nearby.page';
import { SharedModule } from '../../shared.module';
import { NearbyUserElementComponent } from '../../component/element/nearby-user-element/nearby-user-element.component';
import { NgCircleProgressModule } from 'ng-circle-progress';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NearbyPageRoutingModule,
    SharedModule,
    NgCircleProgressModule.forRoot({
      radius: 100,
      outerStrokeWidth: 16,
      innerStrokeWidth: 8,
      outerStrokeColor: '#686868',
      innerStrokeColor: '#c7c7c7',
      animationDuration: 300,
    })
  ],
  declarations: [NearbyPage, NearbyUserElementComponent]
})
export class NearbyPageModule {}
