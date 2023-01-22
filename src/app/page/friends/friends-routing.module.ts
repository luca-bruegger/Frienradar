import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FriendsPage } from './friends.page';
import { FriendRequestsComponent } from '../../component/friend-requests/friend-requests.component';

const routes: Routes = [
  {
    path: '',
    component: FriendsPage
  },
  {
    path: 'requests',
    component: FriendRequestsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FriendsPageRoutingModule {
}
