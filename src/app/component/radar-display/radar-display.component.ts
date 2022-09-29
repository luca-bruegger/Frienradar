import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-radar-display',
  templateUrl: './radar-display.component.html',
  styleUrls: ['./radar-display.component.scss'],
})
export class RadarDisplayComponent {

  @Input() longitude = null;
  @Input() latitude = null;

  constructor() {
  }

}
