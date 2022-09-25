import { Component } from '@angular/core';
import { GeolocationService } from '../../core/service/geolocation.service';

@Component({
  selector: 'app-radar',
  templateUrl: 'radar.page.html',
  styleUrls: ['radar.page.scss'],
})
export class RadarPage {
  location: { latitude: number; longitude: number } = {latitude: null, longitude: null};

  constructor(private geolocationService: GeolocationService) {
    this.geolocationService.positionSubject.subscribe(position => {
      if (position) {
        this.location.latitude = position.coords.latitude;
        this.location.longitude = position.coords.longitude;
      }
    });
  }

}
