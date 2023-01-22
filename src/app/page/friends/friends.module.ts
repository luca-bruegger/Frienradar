import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FriendsPageRoutingModule } from './friends-routing.module';
import { FriendsPage } from './friends.page';
import { FriendRequestsComponent } from '../../component/friend-requests/friend-requests.component';
import { NgCircleProgressModule } from 'ng-circle-progress';

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
    })
  ],
  declarations: [
    FriendsPage,
    FriendRequestsComponent
  ]
})
export class FriendsPageModule {}
