import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NearbyPageRoutingModule } from './nearby-routing.module';

import { NearbyPage } from './nearby.page';
import { SharedModule } from '../../shared.module';
import { UserElementComponent } from '../../component/element/nearby-user-element/user-element.component';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { TranslocoModule } from '@ngneat/transloco';

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
    }),
    TranslocoModule
  ],
  declarations: [NearbyPage, UserElementComponent],
  exports: [UserElementComponent]
})
export class NearbyPageModule {}
