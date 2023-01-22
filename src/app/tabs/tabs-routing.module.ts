import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'profile',
        loadChildren: () => import('../page/profile/profile.module').then(m => m.ProfilePageModule)
      },
      {
        path: 'radar',
        loadChildren: () => import('../page/radar/radar.module').then(m => m.RadarPageModule)
      },
      {
        path: 'friends',
        loadChildren: () => import('../page/friends/friends.module').then(m => m.FriendsPageModule)
      },
      {
        path: 'accounts',
        loadChildren: () => import('../page/accounts/accounts.module').then(m => m.AccountsPageModule)
      },
      {
        path: 'nearby',
        loadChildren: () => import('../page/nearby/nearby.module').then(m => m.NearbyPageModule)
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'radar'
      }
    ]
  },
  {
    path: '',
    redirectTo: 'tabs/radar',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {
}
