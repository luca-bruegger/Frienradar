import { Component, NgZone } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { Path } from './helpers/path';
import { Store } from '@ngxs/store';
import { AppInitService } from './core/service/app-init.service';
import { LocationService } from './core/service/location.service';
import { RealtimeService } from './core/service/realtime.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  hasInitialized = false;

  constructor(private router: Router,
              private zone: NgZone,
              private store: Store,
              private appInitService: AppInitService,
              private locationService: LocationService,
              private realtimeService: RealtimeService) {

    appInitService.init().then(async () => {
      this.hasInitialized = true;
      this.jumpTo();
      this.initializeDeeplinks();
      await locationService.watchGeolocation();
      await realtimeService.watchRealtime();
    });
  }

  private jumpTo() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        Path.setJumpTo(event.url);
      }
    });
  }

  private initializeDeeplinks() {
    App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      this.zone.run(() => {
        const domain = environment.appUrl;
        // The pathArray is now like ['https://frienradar.com', '/login']
        const pathArray = event.url.split(domain);

        const appPath = pathArray.pop();
        if (appPath) {
          this.router.navigateByUrl(appPath);
        }
      });
    });
  }
}
