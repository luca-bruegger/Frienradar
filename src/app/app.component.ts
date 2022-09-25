import { Component, NgZone } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { LocalStorageService } from './core/service/local-storage.service';
import { App, URLOpenListenerEvent } from '@capacitor/app';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private router: Router,
              private localStorageService: LocalStorageService,
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
        this.localStorageService.setJumpTo(event.url);
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
