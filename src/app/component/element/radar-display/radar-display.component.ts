import { Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { MapsHelper } from '../../../helper/maps-helper';
import { environment } from '../../../../environments/environment';
import { PluginListenerHandle } from '@capacitor/core';
import MapOptions = google.maps.MapOptions;
import LatLngLiteral = google.maps.LatLngLiteral;
import Polygon = google.maps.Polygon;
import { LocationService } from '../../../service/location.service';

@Component({
  selector: 'app-radar-display',
  templateUrl: './radar-display.component.html',
  styleUrls: ['./radar-display.component.scss'],
})
export class RadarDisplayComponent implements OnInit, OnChanges {
  @Input() geohash = null;
  @Input() currentDistance: string;
  @ViewChild('map') map;

  mapApiLoaded: Observable<boolean>;

  mapOptions: MapOptions;

  locationBoxOptions;
  center: LatLngLiteral;
  bounds: LatLngLiteral[];
  locationPolygon: Polygon;
  accelHandler: PluginListenerHandle;

  private readonly DEFAULT_ZOOM_STEPS = [15, 12, 8, 5];
  private readonly GEOHASH_LENGTHS = [6, 5, 3, 2];

  constructor(private httpClient: HttpClient,
              private locationService: LocationService) {
  }

  get mapGeohashDistance() {
    return this.GEOHASH_LENGTHS[this.currentDistance];
  }

  get mapZoom() {
    return this.DEFAULT_ZOOM_STEPS[this.currentDistance];
  }

  async ngOnInit() {
    if (!this.mapApiLoaded) {
      this.mapApiLoaded = await this.httpClient.jsonp(`https://maps.googleapis.com/maps/api/js?key=${environment.mapsKey}`, 'callback')
        .pipe(map(() => true), catchError(() => of(false)));
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    this.renderMap(prefersDark.matches);

    prefersDark.addEventListener('change', mediaQuery => {
      this.renderMap(mediaQuery.matches);
    });
  }

  ngOnChanges(simpleChanges) {
    const changedGeohash = simpleChanges.geohash;
    const changedDistance = simpleChanges.currentDistance;


    if (changedDistance || changedGeohash) {
      if (changedDistance) {
        this.currentDistance = changedDistance.currentValue;
      }

      if (changedGeohash && changedGeohash.currentValue && changedGeohash.currentValue.length > 0) {
        this.geohash = changedGeohash.currentValue;
      }

      this.updateLocationBox();
      this.resetLocationBox();
    }
  }

  tryAgain() {
    this.locationService.getCurrentGeohash().then(geohash => {
      this.geohash = geohash;
      this.updateLocationBox();
    });
  }

  setupZoomListener($event: any) {
    $event.addListener('tilesloaded', () => {
      this.resetLocationBox();
    });
  }

  resetMapLocation() {
    this.map.googleMap.setZoom(this.mapZoom);
    this.updateLocationBox();
  }

  private updateLocationBox() {
    if (!this.geohash) {
      return;
    }

    const {lat, lng, boundaries} = MapsHelper.getLocationData(this.mapGeohashDistance, this.geohash);
    this.center = {lat, lng};
    this.bounds = MapsHelper.getBounds(boundaries);
  }

  private resetLocationBox() {
    if (this.locationPolygon && this.locationPolygon.getMap()) {
      this.locationPolygon.setMap(null);
    }

    if (!this.map) {
      return;
    }

    this.locationPolygon = new google.maps.Polygon({
      map: this.map.googleMap,
      paths: this.bounds,
      ...this.locationBoxOptions
    });
  }

  private renderMap(prefersDark) {
    this.mapOptions = prefersDark ? MapsHelper.getDarkOptions() : MapsHelper.getLightOptions();
    this.locationBoxOptions = prefersDark ? MapsHelper.getDarkBoxOptions() : MapsHelper.getLightBoxOptions();
    this.updateLocationBox();
  }
}
