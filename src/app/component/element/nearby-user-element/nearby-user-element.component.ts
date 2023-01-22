import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Account as AccountModel } from '../../../model/account';
import { Contact, ContactState } from '../../../store';
import { Picture } from '../../../helper/picture';

@Component({
  selector: 'app-nearby-user-element',
  templateUrl: './nearby-user-element.component.html',
  styleUrls: ['./nearby-user-element.component.scss'],
})
export class NearbyUserElementComponent implements OnInit {
  @Input() user: AccountModel.User;
  isRequested = false;

  constructor(private store: Store) { }

  get lastSeen() {
    return new Date(this.user.$updatedAt).toLocaleString();
  }

  ngOnInit() {
    this.isRequested = this.store.selectSnapshot(ContactState.sentTo).includes(this.user.$id);

    this.store.select(ContactState.sentTo).subscribe(data => {
      this.isRequested = data.includes(this.user.$id);
    });
  }

  requestUserContact() {
    this.store.dispatch(new Contact.Request({ requestUserId: this.user.$id }));
  }

  profilePicture() {
    return Picture.profilePictureViewURL(this.user.$id, this.user.pictureBreaker);
  }
}
