import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { DistanceChangeComponent } from './component/element/distance-change/distance-change.component';
import { BackendUnderMaintenanceComponent } from './component/backend-under-maintenance/backend-under-maintenance.component';
import { RequestPermissionsComponent } from './component/request-permissions/request-permissions.component';

@NgModule({
  imports: [CommonModule, IonicModule],
  declarations: [
    DistanceChangeComponent,
    BackendUnderMaintenanceComponent,
    RequestPermissionsComponent
  ],
  exports: [
    DistanceChangeComponent,
    BackendUnderMaintenanceComponent,
    RequestPermissionsComponent
  ]
})
export class SharedModule {}
