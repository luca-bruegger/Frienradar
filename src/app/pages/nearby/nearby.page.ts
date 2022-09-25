import { Component, OnInit } from '@angular/core';
import { GeolocationService } from '../../core/service/geolocation.service';
import { UserService } from '../../core/service/user.service';
import { NotificationService } from '../../core/service/notification.service';

@Component({
  selector: 'app-nearby',
  templateUrl: './nearby.page.html',
  styleUrls: ['./nearby.page.scss'],
})
export class NearbyPage implements OnInit {

  nearbyUsers = null;

  constructor(private geolocationService: GeolocationService,
              private userService: UserService,
              private notificationService: NotificationService) {
  }

  ngOnInit() {
    this.geolocationService.nearbyUsersSubject.subscribe(users => {
      if (users) {
        this.nearbyUsers = users;
      }
    });

    this.userService.contactRequests().subscribe((change: any) => {
      if (change && change.users) {
        change.users.forEach(userRequest => {
          if (!userRequest.notificationSent === true) {
            this.notificationService.notifyUserRequest(userRequest);
          }
        });
      }
    });
  }

}
