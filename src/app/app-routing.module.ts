import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './helper/auth.guard';
import { ResetPasswordComponent } from './component/reset-password/reset-password.component';
import { AdditionalLoginDataComponent } from './component/additional-login-data/additional-login-data.component';

const routes: Routes = [
  {
    path: 'login',
    canLoad: [AuthGuard],
    loadChildren: () => import('./page/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'reset-password',
    canLoad: [AuthGuard],
    component: ResetPasswordComponent
  },
  {
    path: 'additional-login-data',
    canLoad: [AuthGuard],
    component: AdditionalLoginDataComponent
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
/*
      enableTracing: true
*/
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
