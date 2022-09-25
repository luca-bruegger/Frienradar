import { Component, Input, OnInit } from '@angular/core';
import { UserService } from "../../service/user.service";
import { BaseService } from "../../service/base.service";

@Component({
  selector: 'app-nearby-user-element',
  templateUrl: './nearby-user-element.component.html',
  styleUrls: ['./nearby-user-element.component.scss'],
})
export class NearbyUserElementComponent implements OnInit {
  @Input() user: { displayName: string; photoURL: string };
  @Input() isRequested: { displayName: string; photoURL: string };

  constructor(private userService: UserService,
              private baseService: BaseService) { }

  ngOnInit() {
  }

  requestUserContact(user: { displayName: string; photoURL: string }) {
    this.userService.setContactRequest(user);
  }
}
