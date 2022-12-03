import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DistanceChangeComponent } from './component/distance-change/distance-change.component';
import { IonicModule } from '@ionic/angular';

@NgModule({
  imports: [CommonModule, IonicModule],
  declarations: [
    DistanceChangeComponent
  ],
  exports: [
    DistanceChangeComponent
  ]
})
export class SharedModule {}
