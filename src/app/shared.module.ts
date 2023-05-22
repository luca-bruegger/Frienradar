import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { DistanceChangeComponent } from './component/element/distance-change/distance-change.component';
import {
  BackendUnderMaintenanceComponent
} from './component/backend-under-maintenance/backend-under-maintenance.component';
import { SocialAccountComponent } from './component/social-account/social-account.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SelectAccountComponent } from './component/social-account/select-account/select-account.component';
import { TranslocoModule } from '@ngneat/transloco';

@NgModule({
  imports: [CommonModule, IonicModule, ReactiveFormsModule, TranslocoModule],
  declarations: [
    DistanceChangeComponent,
    BackendUnderMaintenanceComponent,
    SocialAccountComponent,
    SelectAccountComponent
  ],
  exports: [
    DistanceChangeComponent,
    BackendUnderMaintenanceComponent,
    SocialAccountComponent,
    SelectAccountComponent
  ]
})
export class SharedModule {}
