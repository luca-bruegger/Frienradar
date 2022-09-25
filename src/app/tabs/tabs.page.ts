import { Component } from '@angular/core';
import { GeolocationService } from '../core/service/geolocation.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
})
export class TabsPage {

  constructor(private geolocationService: GeolocationService) {
    geolocationService.watchGeolocation();
  }

}
