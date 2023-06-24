import { AfterViewInit, Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { Path } from './helper/path';
import { Store } from '@ngxs/store';
import { environment } from '../environments/environment';
import { MenuController, NavController, Platform } from '@ionic/angular';
import {
  AdMob,
  AdMobBannerSize,
  BannerAdOptions,
  BannerAdPluginEvents,
  BannerAdPosition,
  BannerAdSize
} from '@capacitor-community/admob';
import { AppService } from './service/app.service';
import { TokenService } from './service/token.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('main-content') mainContent: any;
  isBeta = environment.beta;
  bannerLoaded = false;
  tokenValid = null;

  constructor(private router: Router,
              private navController: NavController,
              private zone: NgZone,
              private store: Store,
              private appService: AppService,
              private platform: Platform,
              private menuController: MenuController,
              private tokenService: TokenService) {
  }

  async ngOnInit() {
    await this.platform.ready();
    await this.appService.init();
    this.tokenValid = this.appService.tokenValid;
    await this.showAds();
    this.jumpTo();
    this.initializeDeeplinking();
    this.initializeGoogleAnalytics();
    this.initializeTokenChange();
  }

  async ngAfterViewInit() {
  }

  private jumpTo() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        Path.setJumpTo(event.url);
      }
    });
  }

  private initializeDeeplinking() {
    App.addListener('appUrlOpen', async (event: URLOpenListenerEvent) => {
      await this.zone.run(async () => {
        const domain = environment.deeplinkDomain;
        const path = event.url.replace(domain, '');

        if (path) {
          await this.navController.navigateRoot(path);
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
    document.documentElement.style.setProperty('--content-ad-padding-bottom', '60px');

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
      requestTrackingAuthorization: false,
      initializeForTesting: !environment.production,
    });
    this.appService.adsShown = true;

    AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
      // Subscribe Banner Event Listener
    });

    const isIos = this.platform.is('ios');

    AdMob.addListener(BannerAdPluginEvents.SizeChanged, (size: AdMobBannerSize) => {
      const appMargin = size.height;
      const root = document.documentElement;
      const app: HTMLElement = document.querySelector('ion-router-outlet');

      if (appMargin === 0) {
        app.style.marginBottom = '0px';
        root.style.setProperty('--content-ad-padding-bottom', '0px');
        return;
      }

      if (appMargin > 0) {
        const body = document.querySelector('body');
        const bodyStyles = window.getComputedStyle(body);
        const safeAreaBottom = bodyStyles.getPropertyValue('--ion-safe-area-bottom');
        root.style.setProperty('--content-ad-padding-bottom', appMargin + (isIos ? 30 : 0) + 'px');
        app.style.marginBottom = `calc(${safeAreaBottom} + ${appMargin - (isIos ? 20 : 0)}px)`;
      }
    });

    const options: BannerAdOptions = {
      adId: isIos ? environment.iosAdId : environment.androidAdId,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: !environment.production,
      npa: true
    };

    await AdMob.showBanner(options);
    this.bannerLoaded = true;
  }

  private initializeTokenChange() {
    this.tokenService.tokenValidChange.subscribe((tokenValid) => {
      this.tokenValid = tokenValid;
    });
  }
}
