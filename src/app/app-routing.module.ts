import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './helpers/auth.guard';
import { ResetPasswordComponent } from './component/reset-password/reset-password.component';

const routes: Routes = [
  {
    path: '',
    canLoad: [AuthGuard],
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'login',
    canLoad: [AuthGuard],
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'reset-password',
    canLoad: [AuthGuard],
    component: ResetPasswordComponent
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
