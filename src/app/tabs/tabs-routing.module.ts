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
        loadChildren: () => import('../pages/profile/profile.module').then(m => m.ProfilePageModule)
      },
      {
        path: 'radar',
        loadChildren: () => import('../pages/radar/radar.module').then(m => m.RadarPageModule)
      },
      {
        path: 'chat',
        loadChildren: () => import('../pages/chat/chat.module').then(m => m.ChatPageModule)
      },
      {
        path: 'interests',
        loadChildren: () => import('../pages/interest/interest.module').then(m => m.InterestPageModule)
      },
      {
        path: 'nearby',
        loadChildren: () => import('../pages/nearby/nearby.module').then(m => m.NearbyPageModule)
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
