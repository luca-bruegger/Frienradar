import { Component, NgZone } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { BaseService } from "./core/service/base.service";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private router: Router,
              private baseService: BaseService,
              private zone: NgZone) {
    this.initializeApp();
  }

  private initializeApp() {
    this.jumpTo();
    this.initializeDeeplinks();
  }

  private jumpTo() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.baseService.setJumpTo(event.url);
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
