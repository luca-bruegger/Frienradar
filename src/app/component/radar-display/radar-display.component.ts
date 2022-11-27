import { Component, ElementRef, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
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

  mapOptions: google.maps.MapOptions;
  bounds: google.maps.LatLngLiteral[];
  locationPolygon: google.maps.Polygon;

  locationBoxOptions = {
    strokeColor: '#0177B6',
    strokeOpacity: 0.5,
    strokeWeight: 3.0,
    fillColor: '#04B3D8',
    fillOpacity: 0.2
  };

  constructor(private httpClient: HttpClient) {}

  ngOnInit() {
    this.mapApiLoaded = this.httpClient.jsonp(`https://maps.googleapis.com/maps/api/js?key=${environment.mapsKey}`, 'callback')
      .pipe(map(() => true), catchError(() => of(false)));

    if (this.geohash) {
      this.updateLocationBox();
    }
  }

  ngOnChanges(simpleChanges) {
    if (simpleChanges.currentDistance || simpleChanges.geohash) {
      if (this.locationPolygon && this.locationPolygon.getMap()) {
        this.locationPolygon.setMap(null);
      }

      if (this.geohash) {

        this.updateLocationBox();
      }
    }
  }

  private updateLocationBox() {
    const {lat, lng, boundaries} = MapsHelper.getLocationData(this.mapGeohashDistance, this.geohash);
    this.mapOptions = MapsHelper.getOptions(lat, lng);
    this.bounds = MapsHelper.getBounds(boundaries);
  }

  setupZoomListener($event: any) {
    $event.addListener('tilesloaded', () => {
      this.resetLocationBox();
    });
  }

  get mapZoom() {
    return Number(Distance[this.currentDistance]) || Distance.close;
  }

  get mapGeohashDistance() {
    return Number(GeohashDistance[this.currentDistance]) || GeohashDistance.close;
  }

  private resetLocationBox() {
    this.locationPolygon = new google.maps.Polygon({
      map: this.map.googleMap,
      paths: this.bounds,
      ...this.locationBoxOptions
    })
  }
}

enum Distance {
  close = 17,
  nearby = 12,
  remote = 7,
  farAway = 5
}

export enum GeohashDistance {
  close = 7,
  nearby = 5,
  remote = 3,
  farAway = 2
}
