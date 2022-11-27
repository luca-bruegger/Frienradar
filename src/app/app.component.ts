import { Component, NgZone } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { Path } from "./helpers/path";
import { Store } from '@ngxs/store';
import { AppInitService } from './core/service/app-init.service';
import { LocationService } from './core/service/location.service';
import { RealtimeService } from './core/service/realtime.service';

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
        Path.setJumpTo(event.url)
      }
    });
  }

  private initializeDeeplinks() {
    App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      this.zone.run(() => {
        // Example url: https://beerswift.app/tabs/tab2
        // slug = /tabs/tab2
        alert(event.url);

        // If no match, do nothing - let regular routing
        // logic take over
      });
    });
  }
}
