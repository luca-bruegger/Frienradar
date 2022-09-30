import { Injectable } from '@angular/core';
import { CanLoad, Route, UrlSegment, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { LoadingController, NavController } from '@ionic/angular';
import { BaseService } from '../core/service/base.service';
import { Appwrite } from "./appwrite";
import { Path } from './path';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanLoad {
  private loginRoute = 'login';

  constructor(private baseService: BaseService,
              private navController: NavController,
              private loadingController: LoadingController) {
  }

  canLoad(route: Route,
          segments: UrlSegment[]): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const segment = segments[0]?.path;

    return Appwrite.accountProvider().getSession('current').then((isAuthenticated) => {
      if (!isAuthenticated) {
        this.navController.navigateBack([Path.login]);
        return false;
      } else {
        return true;
      }
    }).catch(() => {
      if (segment === this.loginRoute) {
         return true;
      }

      this.navController.navigateBack([Path.login]);
      return false;
    });

    // return this.userService.checkAuthenticated().then((data) => {
    //   const isAuthenticated = !!data;
    //   const segment = segments[0]?.path
    //
    //   // enable every route
    //   if (isAuthenticated) {
    //     // TODO: redirect if on login
    //     if (segment === this.loginRoute) {
    //       this.navController.navigateRoot(this.baseService.defaultRoute)
    //     }
    //
    //     return true;
    //   }
    //
    //   // approve login route
    //   if (segment === this.loginRoute && !isAuthenticated) {
    //     return true;
    //   }
    //
    //   // redirect to log in any other case
    //   this.navController.navigateRoot('/login')
    // })
  }

  private async showUserLoadingSpinner() {
    const loadingSpinner = await this.loadingController.create({
      message: 'Lädt ...',
      spinner: 'crescent',
      showBackdrop: true
    });

    await loadingSpinner.present();
    return loadingSpinner;
  }
}
