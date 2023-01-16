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

  mapOptions: MapOptions = MapsHelper.getOptions();
  center: LatLngLiteral;
  bounds: LatLngLiteral[];
  locationPolygon: Polygon;
  accelHandler: PluginListenerHandle;

  locationBoxOptions = {
    strokeColor: '#0177B6',
    strokeOpacity: 0.5,
    strokeWeight: 3.0,
    fillColor: '#04B3D8',
    fillOpacity: 0.2
  };

  constructor(private httpClient: HttpClient) {
  }

  async ngOnInit() {
    if (!this.mapApiLoaded) {
      this.mapApiLoaded = await this.httpClient.jsonp(`https://maps.googleapis.com/maps/api/js?key=${environment.mapsKey}`, 'callback')
        .pipe(map(() => true), catchError(() => of(false)));
    }

    this.updateLocationBox();
  }

  ngOnChanges(simpleChanges) {
    const changedGeohash = simpleChanges.geohash;
    const changedDistance = simpleChanges.currentDistance;

    if (changedDistance || changedGeohash) {
      if (changedDistance) {
        console.log('distance changed', changedDistance.currentValue);
        this.currentDistance = changedDistance.currentValue;
      }

      if (changedGeohash && changedGeohash.currentValue && changedGeohash.currentValue.length > 0) {
        console.log('geohash changed', changedGeohash.currentValue);
        this.geohash = changedGeohash.currentValue;
      }

      console.log(this.geohash, this.currentDistance);

      this.updateLocationBox();
      this.resetLocationBox();
    }
  }

  private updateLocationBox() {
    if (!this.geohash) {
      return;
    }

    const {lat, lng, boundaries} = MapsHelper.getLocationData(this.mapGeohashDistance, this.geohash);
    this.center = {lat, lng};
    this.bounds = MapsHelper.getBounds(boundaries);
  }

  setupZoomListener($event: any) {
    $event.addListener('tilesloaded', () => {
      this.resetLocationBox();
    });
  }

  get mapZoom() {
    return Number(MapZoom[this.currentDistance]) || MapZoom.close;
  }

  get mapGeohashDistance() {
    return Number(GeohashLength[this.currentDistance]) || GeohashLength.close;
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
}

enum MapZoom {
  close = 15,
  nearby = 12,
  remote = 8,
  farAway = 5
}

export enum GeohashLength {
  close = 6,
  nearby = 5,
  remote = 3,
  farAway = 2
}
