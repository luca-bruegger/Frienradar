import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { DistanceChangeComponent } from './component/element/distance-change/distance-change.component';
import { BackendUnderMaintenanceComponent } from './component/backend-under-maintenance/backend-under-maintenance.component';
import { RequestPermissionsComponent } from './component/request-permissions/request-permissions.component';
import { SocialAccountComponent } from './component/social-account/social-account.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  declarations: [
    DistanceChangeComponent,
    BackendUnderMaintenanceComponent,
    RequestPermissionsComponent,
    SocialAccountComponent
  ],
  exports: [
    DistanceChangeComponent,
    BackendUnderMaintenanceComponent,
    RequestPermissionsComponent,
    SocialAccountComponent
  ]
})
export class SharedModule {}
