import { Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { MapsHelper } from '../../helpers/maps-helper';

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

  mapOptions: google.maps.MapOptions = MapsHelper.getOptions();
  center: google.maps.LatLngLiteral;
  bounds: google.maps.LatLngLiteral[];
  locationPolygon: google.maps.Polygon;

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

    if (this.geohash) {
      this.updateLocationBox(this.geohash);
    }
  }

  ngOnChanges(simpleChanges) {
    const changedGeohash = simpleChanges.geohash;
    const changedDistance = simpleChanges.currentDistance;

    if (changedDistance || changedGeohash) {
      const geohash = changedGeohash ? changedGeohash.currentValue : this.geohash;
      const distance = changedDistance ? changedDistance.currentValue : this.currentDistance;

      this.geohash = geohash;
      this.currentDistance = distance;
      this.updateLocationBox(this.geohash);
      this.resetLocationBox();
    }
  }

  private updateLocationBox(geohash) {
    const {lat, lng, boundaries} = MapsHelper.getLocationData(this.mapGeohashDistance, geohash);
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

    if (!this.map)
      return;

    this.locationPolygon = new google.maps.Polygon({
      map: this.map.googleMap,
      paths: this.bounds,
      ...this.locationBoxOptions
    });
  }
}

enum MapZoom {
  close = 17,
  nearby = 12,
  remote = 7,
  farAway = 5
}

export enum GeohashLength {
  close = 7,
  nearby = 5,
  remote = 3,
  farAway = 2
}
