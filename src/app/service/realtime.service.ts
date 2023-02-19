import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Appwrite } from "../helper/appwrite";
import { AccountState, GlobalActions, UserRelation, UserRelationState } from "../store";
import ContactModel from "../model/contact";
import FriendModel from "../model/friend";

@Injectable({
  providedIn: 'root'
})
export class RealtimeService {
  private alive = false;
  private currentUserId = null;

  constructor(private store: Store) {
  }

  private get provider() {
    return Appwrite.providerSingleton;
  }

  watch() {
    this.store.select(AccountState.user).subscribe(user => {
      if (user && !this.alive) {
        this.currentUserId = user.$id;
        this.getContacts();
        this.alive = true;
      }
    });
  }

  private getContacts() {
    this.provider.subscribe(`databases.radar.collections.contacts.documents`, (response: any) => {
        this.updateContactRequests(response);
      }
    );

    this.provider.subscribe(`databases.users.collections.friends.documents`, (response: any) => {
        this.updateFriends(response);
      }
    );
  }

  private updateContactRequests(response: any) {
    const contacts = this.store.selectSnapshot(UserRelationState.contacts) as ContactModel;

    const senderId = response.payload.sender;
    const currentUserIsSender = senderId === this.currentUserId;

    const lastIndexOf = response.events[0].lastIndexOf('.') + 1;
    const event = response.events[0].substring(lastIndexOf, lastIndexOf + 6);

    if (event === 'create') {
      this.addUserToContacts(contacts, response.payload, currentUserIsSender);
    } else if (event === 'delete') {
      this.removeUserFromContacts(contacts, response.payload, currentUserIsSender);
    }
  }

  private addUserToContacts(contacts: ContactModel, payload, currentUserIsSender: boolean) {
    const updatedContacts = {...contacts};
    const {sender, recipient, $id, $createdAt} = payload;

    if (currentUserIsSender) {
      const sentTo = [...contacts.sentTo];
      sentTo.push({
        contactId: $id,
        recipientId: recipient,
        createdAt: $createdAt
      });
      updatedContacts.sentTo = sentTo;
    } else {
      const receivedFrom = [...contacts.receivedFrom];
      receivedFrom.push({
        contactId: $id,
        senderId: sender,
        createdAt: $createdAt
      });
      updatedContacts.receivedFrom = receivedFrom;
    }

    this.store.dispatch(new UserRelation.PatchContacts({contacts: updatedContacts}));
  }

  private removeUserFromContacts(contacts: ContactModel, payload, currentUserIsSender: boolean) {
    const updatedContacts = {...contacts};
    const senderId = payload.sender;
    const recipientId = payload.recipient;

    if (currentUserIsSender) {
      updatedContacts.sentTo = updatedContacts.sentTo.filter(contact => contact.recipientId !== recipientId);
    } else {
      updatedContacts.receivedFrom = updatedContacts.receivedFrom.filter(contact => contact.senderId !== senderId);
    }

    this.store.dispatch(new UserRelation.PatchContacts({contacts: updatedContacts}));
  }

  private updateFriends(response: any) {
    const friends = this.store.selectSnapshot(UserRelationState.friends) as FriendModel[];

    const senderId = response.payload.sender;
    const contactId = response.payload.$id;
    const recipientId = response.payload.recipient;
    const currentUserIsSender = senderId === this.currentUserId;

    const lastIndexOf = response.events[0].lastIndexOf('.') + 1;
    const event = response.events[0].substring(lastIndexOf, lastIndexOf + 6);

    if (event === 'create') {
      console.log(friends);
      console.log(contactId);
      console.log(recipientId);
      console.log('currentUserIsSender', currentUserIsSender);
      this.store.dispatch(new GlobalActions.ShowToast({message: 'New friend request', color: 'success'}));
      this.addFriend();
      //this.addFriend(contacts, senderId, contactId, recipientId, currentUserIsSender);
    } else if (event === 'delete') {
      //this.removeFriend(contacts, senderId, contactId, recipientId, currentUserIsSender);
    }
  }

  private addFriend() {
    const friends = this.store.selectSnapshot(UserRelationState.friends) as FriendModel[];

    const updatedFriends = [...friends];


  }
}
