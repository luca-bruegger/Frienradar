import { Component, Input } from '@angular/core';
import { FirestoreService } from '../../core/service/firestore.service';
import { GeolocationService } from '../../core/service/geolocation.service';

@Component({
  selector: 'app-radar-display',
  templateUrl: './radar-display.component.html',
  styleUrls: ['./radar-display.component.scss'],
})
export class RadarDisplayComponent {

  @Input() longitude = null;
  @Input() latitude = null;

  constructor(private firestoreService: FirestoreService,
              private geoLocationService: GeolocationService) {
  }

}
