import { Component, OnInit } from '@angular/core';
import { GeolocationService } from '../../core/service/geolocation.service';
import { NotificationService } from '../../core/service/notification.service';

@Component({
  selector: 'app-nearby',
  templateUrl: './nearby.page.html',
  styleUrls: ['./nearby.page.scss'],
})
export class NearbyPage implements OnInit {

  nearbyUsers = null;

  constructor(private geolocationService: GeolocationService,
              private notificationService: NotificationService) {
  }

  ngOnInit() {
    this.geolocationService.nearbyUsersSubject.subscribe(users => {
      if (users) {
        this.nearbyUsers = users;
      }
    });

  }

}
