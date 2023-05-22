import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FriendsPageRoutingModule } from './friends-routing.module';
import { FriendsPage } from './friends.page';
import { FriendRequestsComponent } from '../../component/friend-requests/friend-requests.component';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { NearbyPageModule } from '../nearby/nearby.module';
import { FriendsDisplayComponent } from '../../component/friends-display/friends-display.component';
import { SharedModule } from '../../shared.module';
import { TranslocoModule } from '@ngneat/transloco';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FriendsPageRoutingModule,
    NgCircleProgressModule.forRoot({
      radius: 100,
      outerStrokeWidth: 16,
      innerStrokeWidth: 8,
      outerStrokeColor: '#686868',
      innerStrokeColor: '#c7c7c7',
      animationDuration: 300,
    }),
    NearbyPageModule,
    SharedModule,
    TranslocoModule
  ],
  declarations: [
    FriendsPage,
    FriendRequestsComponent,
    FriendsDisplayComponent
  ]
})
export class FriendsPageModule {}
