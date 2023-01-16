import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Account as AccountModel } from '../../../model/account';
import { Contact } from '../../../store';
import { Picture } from '../../../helper/picture';

@Component({
  selector: 'app-nearby-user-element',
  templateUrl: './nearby-user-element.component.html',
  styleUrls: ['./nearby-user-element.component.scss'],
})
export class NearbyUserElementComponent implements OnInit {
  @Input() user: AccountModel.User;
  @Input() isRequested: { displayName: string; profilePicture: string };

  constructor(private store: Store) { }

  ngOnInit() {
  }

  requestUserContact() {
    this.store.dispatch(new Contact.Request({ requestUserId: this.user.$id }));
  }

  get lastSeen() {
    return new Date(this.user.$updatedAt).toLocaleTimeString().substring(0, 5);
  }

  profilePicture() {
    return Picture.profilePictureViewURL(this.user.$id, this.user.pictureBreaker);
  }
}
