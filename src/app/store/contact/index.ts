import { Injectable, NgZone } from '@angular/core';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { GlobalActions } from '../global';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Appwrite } from '../../helper/appwrite';
import { AccountState } from '../account';
import { Query } from 'appwrite';
import { environment } from '../../../environments/environment';
import ContactModel from '../../model/contact';
import FriendModel from '../../model/friend';

/* State Model */
@Injectable()
export class UserRelationStateModel {
  contactRequest: ContactModel;
  friends: FriendModel[];
}

export namespace UserRelation {
  /** Actions */
  export class Fetch {
    static readonly type = '[UserRelation] Fetch';
  }

  export class Request {
    static readonly type = '[UserRelation] Request';

    constructor(public payload: { requestUserId: string }) {
    }
  }

  export class RemoveRequest {
    static readonly type = '[UserRelation] Remove Request';

    constructor(public payload: { contactId: string }) {
    }
  }

  export class PatchContacts {
    static readonly type = '[UserRelation] Patch Contacts';

    constructor(public payload: { contacts: ContactModel }) {
    }
  }

  export class UpdateRequested {
    static readonly type = '[UserRelation] Update Requested';

    constructor(public payload: { requested: string[] }) {
    }
  }

  export class AddFriend {
    static readonly type = '[Contact] Add Friend';

    constructor(public payload: { sender: string }) {
    }
  }
}

@State<UserRelationStateModel>({
  name: 'userRelation',
  defaults: {
    contactRequest: {
      receivedFrom: [],
      sentTo: []
    },
    friends: []
  }
})

@Injectable()
export class UserRelationState {
  constructor(private navController: NavController,
              private ngZone: NgZone,
              private store: Store,
              private router: Router) {
  }

  @Selector()
  static contacts(state: UserRelationStateModel) {
    return state.contactRequest;
  }

  @Selector()
  static requestedCount(state: UserRelationStateModel) {
    return state.contactRequest.receivedFrom.length;
  }

  @Selector()
  static requested(state: UserRelationStateModel) {
    return state.contactRequest.receivedFrom;
  }

  @Selector()
  static sentTo(state: UserRelationStateModel) {
    return state.contactRequest.sentTo;
  }

  @Action(UserRelation.UpdateRequested)
  async updateRequested(
    {patchState, dispatch}: StateContext<UserRelationStateModel>,
    action: UserRelation.UpdateRequested
  ) {
    const {requested} = action.payload;
    const filteredRequested = requested.filter((item) => item !== '');
    patchState({
      contactRequest: {
        requested: filteredRequested
      } as unknown as ContactModel
    });
  }

  @Action(UserRelation.Fetch)
  async fetch(
    {patchState, dispatch}: StateContext<UserRelationStateModel>,
    action: UserRelation.Fetch
  ) {
    const userId = this.store.selectSnapshot(AccountState.user).$id;

    const contacts = await this.fetchContacts(userId);
    patchState({
      contactRequest: contacts
    });

    await this.fetchFriends(userId);


  }

  @Action(UserRelation.Request)
  async request(
    {patchState, dispatch}: StateContext<UserRelationStateModel>,
    action: UserRelation.Request
  ) {
    const {requestUserId} = action.payload;
    const currentUserId = this.store.selectSnapshot(AccountState.user).$id;

    const data = JSON.stringify({
      sender: currentUserId,
      recipient: requestUserId
    });

    try {
      const execution = await Appwrite.functionsProvider().createExecution('contact-requests', data) as any;
      if (execution.response === '') {
        return;
      }

      const error = JSON.parse(execution.response).error;
      if (error) {
        throw error;
      }
    } catch (e: any) {
      this.store.dispatch(new GlobalActions.HandleError({error: e as Error}));
    }
  }

  @Action(UserRelation.RemoveRequest)
  async removeRequest(
    {patchState, dispatch}: StateContext<UserRelationStateModel>,
    action: UserRelation.RemoveRequest
  ) {
    const {contactId} = action.payload;

    try {
      await Appwrite.databasesProvider().deleteDocument(
        environment.radarDatabaseId,
        environment.contactsCollectionId,
        contactId
      );

    } catch (e: any) {
      this.store.dispatch(new GlobalActions.HandleError({error: e as Error}));
    }
  }

  @Action(UserRelation.AddFriend)
  async addFriend(
    {patchState, dispatch}: StateContext<UserRelationStateModel>,
    action: UserRelation.AddFriend
  ) {
    const {sender} = action.payload;
    const userId = this.store.selectSnapshot(AccountState.user).$id;

    const data = JSON.stringify({
      sender,
      recipient: userId
    });

    try {
      const execution = await Appwrite.functionsProvider().createExecution('add-friend', data) as any;
      if (execution.response === '') {
        return;
      }

      const error = JSON.parse(execution.response).error;
      if (error) {
        throw error;
      }
    } catch (e: any) {
      this.store.dispatch(new GlobalActions.HandleError({error: e as Error}));
    }
  }

  @Action(UserRelation.PatchContacts)
  async patchContacts(
    {patchState, dispatch}: StateContext<UserRelationStateModel>,
    action: UserRelation.PatchContacts
  ) {
    const {contacts} = action.payload;
    patchState({contactRequest: contacts});
  }

  private async fetchContacts(userId: string) {
    try {
      const query = `query ListContacts(
              $databaseId: String!
              $collectionId: String!
              $queries: [String]
            ) {
              databasesListDocuments(
                databaseId: $databaseId
                collectionId: $collectionId
                queries: $queries
              ) {
                documents {
                  data
                  _id
                }
              }
            }`;


      const recipientDataResponse = await Appwrite.graphQLProvider().query({
        query,
        variables: {
          databaseId: environment.radarDatabaseId,
          collectionId: environment.contactsCollectionId,
          queries: [
            Query.equal('sender', userId),
          ]
        }
      }) as { data: { databasesListDocuments: { documents: { data: string; _id: string }[]; total: number } }; errors: any };

      const recipients = recipientDataResponse.data.databasesListDocuments.documents.map((item) => {
        const {data, _id} = item;
        const parsedData = JSON.parse(data);

        return {
          recipientId: parsedData.recipient,
          contactId: _id
        };
      });

      const senderDataResponse = await Appwrite.graphQLProvider().query({
        query,
        variables: {
          databaseId: environment.radarDatabaseId,
          collectionId: environment.contactsCollectionId,
          queries: [
            Query.equal('recipient', userId),
          ]
        }
      }) as { data: { databasesListDocuments: { documents: { data: string; _id: string }[]; total: number } }; errors: any };

      const senders = senderDataResponse.data.databasesListDocuments.documents.map((item) => {
        const {data, _id} = item;
        const parsedData = JSON.parse(data);

        return {
          senderId: parsedData.sender,
          contactId: _id
        };
      });

      return {
        sentTo: recipients,
        receivedFrom: senders
      };
    } catch (e: any) {
      this.store.dispatch(new GlobalActions.HandleError({error: e as Error}));
    }
  }

  private async fetchFriends(userId: string) {
    try {
      const friends = [];

      const query = `query ListFriends(
              $databaseId: String!
              $collectionId: String!
              $queries: [String]
            ) {
              databasesListDocuments(
                databaseId: $databaseId
                collectionId: $collectionId
                queries: $queries
              ) {
                documents {
                  data
                  _id
                }
              }
            }`;


      const friendA = await Appwrite.graphQLProvider().query({
        query,
        variables: {
          databaseId: environment.usersDatabaseId,
          collectionId: environment.friendsCollectionId,
          queries: [
            Query.equal('friendA', userId),
          ]
        }
      }) as { data: { databasesListDocuments: { documents: { data: string; _id: string }[]; total: number } }; errors: any };

      const friendB = await Appwrite.graphQLProvider().query({
        query,
        variables: {
          databaseId: environment.usersDatabaseId,
          collectionId: environment.friendsCollectionId,
          queries: [
            Query.equal('friendB', userId),
          ]
        }
      }) as { data: { databasesListDocuments: { documents: { data: string; _id: string }[]; total: number } }; errors: any };

      console.log(friendA, friendB);

      return {
        friends
      };
    } catch (e: any) {
      this.store.dispatch(new GlobalActions.HandleError({error: e as Error}));
    }
  }
}
