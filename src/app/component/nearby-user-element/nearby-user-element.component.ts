import { Component, Input, OnInit } from '@angular/core';
import { UserService } from 'src/app/core/appwrite/user.service';
import { BaseService } from "../../core/service/base.service";

@Component({
  selector: 'app-nearby-user-element',
  templateUrl: './nearby-user-element.component.html',
  styleUrls: ['./nearby-user-element.component.scss'],
})
export class NearbyUserElementComponent implements OnInit {
  @Input() user: { displayName: string; profilePicture: string };
  @Input() isRequested: { displayName: string; profilePicture: string };

  constructor(private userService: UserService,
              private baseService: BaseService) { }

  ngOnInit() {
  }

  requestUserContact(user: { displayName: string; photoURL: string }) {
    this.userService.setContactRequest(user);
  }
}
