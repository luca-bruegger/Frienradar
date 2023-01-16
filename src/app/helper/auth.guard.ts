import { Injectable } from '@angular/core';
import { CanLoad, Route, UrlSegment, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { NavController } from '@ionic/angular';
import { Path } from './path';
import { Store } from '@ngxs/store';
import { AccountState } from '../store';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanLoad {
  constructor(private navController: NavController,
              private store: Store) {
  }

  canLoad(route: Route,
          segments: UrlSegment[]): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const isAuthenticated = !!this.store.selectSnapshot(AccountState.session);

    if (isAuthenticated) {
      this.checkIfIsOnUnauthorizedRoute(segments);
      return true;
    } else {
      if ('/' + segments[0].path !== Path.login) {
        this.navController.navigateRoot([Path.login]);
      }
      return true;
    }
  }

  private checkIfIsOnUnauthorizedRoute(segments: UrlSegment[]) {
    if (Path.unauthorizedRoutes.includes('/' + segments[0].path)) {
      this.navController.navigateBack([Path.getJumpTo()]);
    }
  }
}
