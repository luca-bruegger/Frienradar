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
import { from, Observable } from 'rxjs';
import { NavController } from '@ionic/angular';
import { Path } from './path';
import { TokenService } from '../service/token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanLoad, CanActivate {

  constructor(private navController: NavController,
              private tokenService: TokenService) {
  }

  canLoad(route: Route,
          segments: UrlSegment[]): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return from(this.handle(segments));
  }

  canActivate(childRoute: ActivatedRouteSnapshot,
              state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return from(this.handle(childRoute.url));
  }

  private async handle(segments: UrlSegment[]) {
    const isAuthenticated = await this.tokenService.isTokenValid();
    const path = '/' + segments[0].path;
    const unauthorizedPath = Path.unauthorizedRoutes.includes(path);

    if (isAuthenticated && unauthorizedPath) {
      await this.navController.navigateBack([Path.getJumpTo()]);
      return false;
    } else if (!isAuthenticated && !unauthorizedPath) {
      await this.navController.navigateRoot([Path.login]);
      return false;
    } else if (!isAuthenticated && unauthorizedPath) {
      return true;
    } else if (isAuthenticated && !unauthorizedPath) {
      return true;
    }

    return undefined;
  }
}
