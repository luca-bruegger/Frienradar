import { Injectable, NgZone } from '@angular/core';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { GlobalActions } from '../global';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Contact as ContactModel } from '../../model/contact';
import { Appwrite } from '../../helper/appwrite';
import { AccountState } from '../account';
import { Query } from 'appwrite';
import { environment } from '../../../environments/environment';

/* State Model */
@Injectable()
export class ContactStateModel {
  contacts: ContactModel;
}

export namespace Contact {
  /** Actions */
  export class Fetch {
    static readonly type = '[Contact] Fetch';
  }

  export class Request {
    static readonly type = '[Contact] Request';

    constructor(public payload: { requestUserId: string }) {
    }
  }

  export class RemoveRequest {
    static readonly type = '[Contact] Remove Request';

    constructor(public payload: { requestUserId: string }) {
    }
  }

  export class UpdateRequested {
    static readonly type = '[Contact] UpdateRequested';

    constructor(public payload: { requested: string[] }) {
    }
  }
}

@State<ContactStateModel>({
  name: 'contact',
  defaults: {
    contacts: null
  },
})

@Injectable()
export class ContactState {
  constructor(private navController: NavController,
              private ngZone: NgZone,
              private store: Store,
              private router: Router) {
  }

  @Selector()
  static contacts(state: ContactStateModel) {
    return state.contacts;
  }

  @Selector()
  static requestedCount(state: ContactStateModel) {
    return state.contacts.receivedFrom.length;
  }

  @Selector()
  static requested(state: ContactStateModel) {
    return state.contacts.receivedFrom;
  }

  @Selector()
  static sentTo(state: ContactStateModel) {
    return state.contacts.sentTo;
  }

  @Action(Contact.UpdateRequested)
  async updateRequested(
    {patchState, dispatch}: StateContext<ContactStateModel>,
    action: Contact.UpdateRequested
  ) {
    const {requested} = action.payload;
    const filteredRequested = requested.filter((item) => item !== '');
    patchState({
      contacts: {
        requested: filteredRequested
      } as unknown as ContactModel
    });
  }

  @Action(Contact.Fetch)
  async fetch(
    {patchState, dispatch}: StateContext<ContactStateModel>,
    action: Contact.Fetch
  ) {
    const contacts = this.store.selectSnapshot(ContactState.contacts);
    const userId = this.store.selectSnapshot(AccountState.user).$id;

    try {
      // If session is already fetched, don't fetch again
      const receivedFromData = await Appwrite.databasesProvider().listDocuments(
        environment.radarDatabaseId,
        environment.contactsCollectionId,
        [
          Query.equal('recipient', userId)
        ]);
      const receivedFrom = receivedFromData.documents.map((item) => item.sender);

      const sentToData = await Appwrite.databasesProvider().listDocuments(
        environment.radarDatabaseId,
        environment.contactsCollectionId,
        [
          Query.equal('sender', userId)
        ]);

      const sentTo = sentToData.documents.map((item) => item.recipient);
      patchState({
        contacts: {
          receivedFrom,
          sentTo
        } as unknown as ContactModel
      });
    } catch (e: any) {
      // if (e.type === 'document_not_found') {
      //   await Appwrite.databasesProvider().createDocument(environment.radarDatabaseId, environment.contactsCollectionId, userId, {
      //     accepted: [],
      //     requested: []
      //   }, [
      //     Permission.read(Role.users()),
      //     Permission.delete(Role.user(userId)),
      //     Permission.write(Role.user(userId))
      //   ]);
      //   return;
      // }
      this.store.dispatch(new GlobalActions.HandleError({error: e as Error}));
    }
  }

  @Action(Contact.Request)
  async request(
    {patchState, dispatch}: StateContext<ContactStateModel>,
    action: Contact.Request
  ) {
    const {requestUserId} = action.payload;
    const currentUserId = this.store.selectSnapshot(AccountState.user).$id;
    const contacts = this.store.selectSnapshot(ContactState.contacts);

    try {
      const requestedUserContacts = await Appwrite.databasesProvider().createDocument(
        environment.radarDatabaseId,
        environment.contactsCollectionId,
        'unique()',
        {
          sender: currentUserId,
          recipient: requestUserId
        }
      );

      const updatedContacts = {
        sentTo: [...contacts.sentTo, requestUserId],
        receivedFrom: contacts.receivedFrom
      };

      patchState({
        contacts: updatedContacts
      });
    } catch (e: any) {
      this.store.dispatch(new GlobalActions.HandleError({error: e as Error}));
    }
  }

  @Action(Contact.RemoveRequest)
  async removeRequest(
    {patchState, dispatch}: StateContext<ContactStateModel>,
    action: Contact.RemoveRequest
  ) {
    const { requestUserId } = action.payload;
    const currentUserId = this.store.selectSnapshot(AccountState.user).$id;
    const contacts = this.store.selectSnapshot(ContactState.contacts);

    try {

    } catch (e: any) {
      this.store.dispatch(new GlobalActions.HandleError({error: e as Error}));
    }
  }
}
