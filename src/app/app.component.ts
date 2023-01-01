import { Component, NgZone } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { Path } from './helper/path';
import { Store } from '@ngxs/store';
import { AppInitService } from './core/service/app-init.service';
import { LocationService } from './core/service/location.service';
import { RealtimeService } from './core/service/realtime.service';
import { environment } from '../environments/environment';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  hasInitialized = false;
  isBeta = environment.beta;

  constructor(private router: Router,
              private navController: NavController,
              private zone: NgZone,
              private store: Store,
              private appInitService: AppInitService,
              private locationService: LocationService,
              private realtimeService: RealtimeService) {

    appInitService.init().then(async () => {
      this.hasInitialized = true;
      this.jumpTo();
      this.initializeDeeplinking();
      this.initializeGoogleAnalytics();
      await locationService.watch();
      await realtimeService.watch();
    });
  }

  private jumpTo() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        Path.setJumpTo(event.url);
      }
    });
  }

  private initializeDeeplinking() {
    App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      this.zone.run(() => {
        const domain = environment.appUrl;
        const pathArray = event.url.split(domain);

        const appPath = pathArray.pop();
        if (appPath) {
          this.navController.navigateRoot(appPath);
        }
      });
    });
  }

  private initializeGoogleAnalytics() {
    // this.ga.startTrackerWithId(environment.googleAnalyticsId)
    //   .then(() => {
    //     console.log('Google analytics is ready now');
    //     this.ga.trackView('test');
    //     // Tracker is ready
    //     // You can now track pages or set additional information such as AppVersion or UserId
    //   })
    //   .catch(e => console.log('Error starting GoogleAnalytics', e));
  }
}
