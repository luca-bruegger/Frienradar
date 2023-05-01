import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SocialAccountsPage } from './social-accounts.page';
import {
  CreateSocialAccountComponent
} from '../../component/social-account/create-social-account/create-social-account.component';

const routes: Routes = [
  {
    path: '',
    component: SocialAccountsPage
  },
  {
    path: 'create',
    component: CreateSocialAccountComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SocialAccountsRoutingModule {}
