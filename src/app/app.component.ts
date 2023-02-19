import { Component, NgZone, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { Path } from './helper/path';
import { Store } from '@ngxs/store';
import { environment } from '../environments/environment';
import { NavController, Platform } from '@ionic/angular';
import {
  AdMob,
  AdMobBannerSize,
  BannerAdOptions,
  BannerAdPluginEvents,
  BannerAdPosition,
  BannerAdSize
} from '@capacitor-community/admob';
import { AppInitService } from "./service/app-init.service";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  hasInitialized = false;
  isBeta = environment.beta;
  bannerLoaded = false;

  constructor(private router: Router,
              private navController: NavController,
              private zone: NgZone,
              private store: Store,
              private appInitService: AppInitService,
              private platform: Platform) {
  }

  async ngOnInit() {
    await this.showAds();
    await this.appInitService.init();
    this.hasInitialized = true;
    this.jumpTo();
    this.initializeDeeplinking();
    this.initializeGoogleAnalytics();
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

  private async showAds() {
    const { status } = await AdMob.trackingAuthorizationStatus();
    const isCapacitor = this.platform.is('capacitor');

    if (!isCapacitor) {
      return;
    }

    if (status === 'notDetermined') {
      /**
       * If you want to explain TrackingAuthorization before showing the iOS dialog,
       * you can show the modal here.
       * ex)
       * const modal = await this.modalCtrl.create({
       *   component: RequestTrackingPage,
       * });
       * await modal.present();
       * await modal.onDidDismiss();  // Wait for close modal
       **/
    }

    await AdMob.initialize({
      requestTrackingAuthorization: true,
      initializeForTesting: !environment.production,
    });

    AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
      // Subscribe Banner Event Listener
    });

    AdMob.addListener(BannerAdPluginEvents.SizeChanged, (size: AdMobBannerSize) => {
      // Subscribe Change Banner Size
    });
    const isIos = this.platform.is('ios');

    const options: BannerAdOptions = {
      adId: isIos ? environment.iosAdId : environment.androidAdId,
      adSize: BannerAdSize.BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: !environment.production,
      npa: true
    };

    await AdMob.showBanner(options);
    this.bannerLoaded = true;
  }
}
