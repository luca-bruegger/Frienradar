import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { AuthGuard } from '../helper/auth.guard';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'radar',
        loadChildren: () => import('../page/radar/radar.module').then(m => m.RadarPageModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'friends',
        loadChildren: () => import('../page/friends/friends.module').then(m => m.FriendsPageModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'social-accounts',
        loadChildren: () => import('../page/social-accounts/social-accounts.module').then(m => m.SocialAccountsPageModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'nearby',
        loadChildren: () => import('../page/nearby/nearby.module').then(m => m.NearbyPageModule),
        canActivate: [AuthGuard]
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
