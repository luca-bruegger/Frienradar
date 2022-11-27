import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DistanceChangeComponent } from './component/distance-change/distance-change.component';

@NgModule({
  imports: [CommonModule],
  declarations: [
    DistanceChangeComponent
  ],
  exports: [
    DistanceChangeComponent
  ]
})
export class SharedModule {}
