import { Injectable } from '@angular/core';
import { CanLoad, Route, UrlSegment, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { LoadingController, NavController } from '@ionic/angular';
import { map } from 'rxjs/operators';
import { LocalStorageService } from '../service/local-storage.service';
import { BaseService } from '../service/base.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanLoad {
  private defaultRoute = this.localStorageService.getJumpTo() || '/tabs/profile';
  private loginRoute = '/login';

  constructor(private baseService: BaseService,
              private navController: NavController,
              private loadingController: LoadingController,
              private localStorageService: LocalStorageService) {
  }

  canLoad(route: Route,
          segments: UrlSegment[]): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.baseService.userSubject.value == null) {
      this.verifyThatUserHasBeenLoaded();
      return false;
    }

    return this.baseService.userSubject.pipe(map(user => {
        const isUserLoggedIn = !!user.uid;
        const isLoginRoute = this.isLoginRoute(segments);

        // if user is not logged in and is not on login route, redirect to login page
        if (!isUserLoggedIn && !isLoginRoute) {
          this.navController.navigateRoot(this.loginRoute);
          return false;
        }

        // if user is logged in and is on login route, redirect to profile page
        if (isUserLoggedIn && isLoginRoute) {
          console.warn('default route: ', this.defaultRoute);
          this.navController.navigateRoot(this.defaultRoute);
          return false;
        }

        return true;
      })
    );
  }

  isLoginRoute(segments) {
    const paths = segments.map(segment => segment.path);
    return paths.includes('login');
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

  private verifyThatUserHasBeenLoaded() {
    this.showUserLoadingSpinner().then(loadingSpinner => {
      this.baseService.userSubject.subscribe(user => {
        if (user) {
          loadingSpinner.dismiss().then(() => {
            if (user.uid) {
              this.navController.navigateRoot(this.defaultRoute);
              return;
            }

            this.navController.navigateRoot(this.loginRoute);
          });
        }
      });
    });
  }
}
