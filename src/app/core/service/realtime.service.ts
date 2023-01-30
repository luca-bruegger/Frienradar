import { Injectable } from '@angular/core';
import { Appwrite } from '../../helper/appwrite';
import { AccountState, UserRelation, UserRelationState } from '../../store';
import { Store } from '@ngxs/store';
import ContactModel from '../../model/contact';

@Injectable({
  providedIn: 'root'
})
export class RealtimeService {
  private alive = false;

  constructor(private store: Store) {
  }

  private get provider() {
    return Appwrite.providerSingleton;
  }

  watch() {
    this.store.select(AccountState.user).subscribe(user => {
      if (user && !this.alive) {
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
  }

  private updateContactRequests(response: any) {
    const contacts = this.store.selectSnapshot(UserRelationState.contacts) as ContactModel;
    const currentUserId = this.store.selectSnapshot(AccountState.user).$id;

    const senderId = response.payload.sender;
    const contactId = response.payload.$id;
    const recipientId = response.payload.recipient;
    const currentUserIsSender = senderId === currentUserId;

    const lastIndexOf = response.events[0].lastIndexOf('.') + 1;
    const event = response.events[0].substring(lastIndexOf, lastIndexOf + 6);

    if (event === 'create') {
      this.addUserToContacts(contacts, senderId, contactId, recipientId, currentUserIsSender);
    } else if (event === 'delete') {
      this.removeUserFromContacts(contacts, senderId, contactId, recipientId, currentUserIsSender);
    }
  }

  private addUserToContacts(contacts: ContactModel, senderId: any, contactId: any, recipientId: string, currentUserIsSender: boolean) {
    const updatedContacts = {...contacts};

    if (currentUserIsSender) {
      const sentTo = [...contacts.sentTo];
      sentTo.push({ contactId, recipientId });
      updatedContacts.sentTo = sentTo;
    } else {
      const receivedFrom = [...contacts.receivedFrom];
      receivedFrom.push({ contactId, senderId });
      updatedContacts.receivedFrom = receivedFrom;
    }

    this.store.dispatch(new UserRelation.PatchContacts({ contacts: updatedContacts }));
  }

  private removeUserFromContacts(contacts: ContactModel, senderId: any, contactId: any, recipientId: string, currentUserIsSender: boolean) {
    const updatedContacts = {...contacts};

    if (currentUserIsSender) {
      updatedContacts.sentTo = updatedContacts.sentTo.filter(contact => contact.recipientId !== recipientId);
    } else {
      updatedContacts.receivedFrom = updatedContacts.receivedFrom.filter(contact => contact.senderId !== senderId);
    }

    this.store.dispatch(new UserRelation.PatchContacts({ contacts: updatedContacts }));
  }
}
