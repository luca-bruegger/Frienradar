import { Injectable, NgZone } from '@angular/core';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { GlobalActions } from '../global';
import { Observable } from "rxjs";
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Contact as ContactModel } from '../../model/contact';
import { Appwrite } from '../../helpers/appwrite';
import { AccountState } from '../account';
import { Permission, Role } from 'appwrite';
import { Md5 } from 'ts-md5';
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

  @Action(Contact.Fetch)
  async fetch(
    {patchState, dispatch}: StateContext<ContactStateModel>,
    action: Contact.Fetch
  ) {
    let contacts = this.store.selectSnapshot(ContactState.contacts);
    const userId = this.store.selectSnapshot(AccountState.user).$id;

    try {
      // If session is already fetched, don't fetch again
      if (!contacts) {
        const loaded_contacts = await Appwrite.databasesProvider().getDocument(environment.radarDatabaseId, 'contacts', userId);
        patchState({
          contacts: loaded_contacts as unknown as ContactModel
        });
      }
    } catch (e: any) {
      if (e.type == 'document_not_found') {
        await Appwrite.databasesProvider().createDocument(environment.radarDatabaseId, environment.contactsCollectionId, userId, {
          accepted: [],
          requested: []
        }, [
          Permission.read(Role.users()),
          Permission.delete(Role.user(userId)),
          Permission.write(Role.user(userId))
        ]);
        return;
      }
      this.handleError(e, dispatch);
    }
  }

  @Action(Contact.Request)
  async request(
    {patchState, dispatch}: StateContext<ContactStateModel>,
    action: Contact.Request
  ) {
    let { requestUserId } = action.payload;
    const userId = this.store.selectSnapshot(AccountState.user).$id;
    const contacts = this.store.selectSnapshot(ContactState.contacts);


    try {
      if (!contacts.requested.includes(requestUserId)) {
        let hash = Md5.hashStr("password");
        console.log(hash);


        // CREATE REQUEST
        /*

           --- REQUEST ---
           First create new document (random id, { requestUserId: userId, userId: requestUserId, accepted: false })
           add requestUserId to contacts.requested from current user

           --- ACCEPT ---
           Delete request Document, add requestUserId to contacts.accepted from current user !!Make sure document can only be updated from current user!!
           remove requestUserId from contacts.requested from current user

            --- REJECT ---
            Delete request Document (where requestUserId matches current user id), remove requestUserId from contacts.requested from current user

         */

        // const loaded_contacts = await Appwrite.databasesProvider().updateDocument('radar', 'friendships', , {
        //   accepted: false
        // }, [
        //   Permission.read(Role.user(userId)),
        //   Permission.read(Role.user(requestUserId)),
        //   Permission.delete(Role.user(requestUserId)),
        //   Permission.delete(Role.user(userId)),
        //   Permission.write(Role.user(requestUserId)),
        // ]);
        patchState({
          //contacts: loaded_contacts as unknown as ContactModel
        });
      } else {
        dispatch(
          new GlobalActions.showToast({
            error: {message: 'Already requested'} as Error,
            color: 'danger',
          })
        );
      }
    } catch (e: any) {
      this.handleError(e, dispatch);
    }
  }

  private handleError(e: any, dispatch: (actions: any) => Observable<void>) {
    dispatch(
      new GlobalActions.showToast({
        error: e,
        color: 'danger',
      })
    );
  }
}
