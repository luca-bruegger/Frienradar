import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanLoad,
  Route,
  RouterStateSnapshot,
  UrlSegment,
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
import { NavController } from '@ionic/angular';
import { Appwrite } from './appwrite';
import { Path } from './path';
import { Store } from '@ngxs/store';
import { AccountState } from '../store';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanLoad {
    private loginRoute = 'login';

  constructor(private navController: NavController,
              private store: Store) {
  }

  canLoad(route: Route,
          segments: UrlSegment[]): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const segment = segments[0]?.path;

    const isAuthenticated = !this.store.selectSnapshot(AccountState.session);
    if (!isAuthenticated) {
      console.log('not authenticated');
      this.navController.navigateBack([Path.login]);
      return false;
    } else {
      return true;
    }
  }
}
