import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Store } from '@ngxs/store';
import { Consumer, createConsumer } from '@rails/actioncable';
import { GlobalActions, UserRelation } from '../store';

@Injectable({
  providedIn: 'root'
})
export class ActionCableService {
  private cable: Consumer = null;

  constructor(private store: Store) {
  }

  subscribeInvitations(guid: string) {
    this.cable.subscriptions.create({
      channel: 'InvitationsChannel',
      guid
    }, {
      connected: () => {
        console.log('connected');
      },
      received: (params) => {
        console.log(params);
        console.log('received', params.data);
        const invitation = {
          type: 'invitation',
          id: params.data.id,
          attributes: params.data
        };

        if (params.type == 'sent') {
          this.store.dispatch(new UserRelation.AppendRequestedFriend({ userGuid: params.data.friend_guid }));
          this.store.dispatch(new GlobalActions.ShowToast({
            message: 'Anfrage gesendet an ' + params.data.friend_username,
            color: 'success'
          }));
        } else if (params.type == 'received') {
          this.store.dispatch(new UserRelation.AppendFriendRequest({ invitation }));
          this.store.dispatch(new GlobalActions.ShowToast({
            message: 'Anfrage erhalten von ' + params.data.sender_username,
            color: 'success'
          }));
        } else if (params.type == 'accepted') {
          this.store.dispatch(new UserRelation.RemoveFriendRequest({ userGuid: params.data.friend_guid }));
          this.store.dispatch(new UserRelation.AddFriend({ friendGuid: params.data.friend_guid }));
          this.store.dispatch(new GlobalActions.ShowToast({
            message: params.data.friend_username + ' hat die Anfrage angenommen',
            color: 'success'
          }));
        } else if (params.type == 'rejected') {
          this.store.dispatch(new UserRelation.RemoveFriendRequest({ userGuid: params.data.friend_guid }));
          this.store.dispatch(new GlobalActions.ShowToast({
            message: params.data.friend_username + ' hat die Anfrage abgelehnt',
            color: 'danger'
          }));
        }
      },
      disconnected: () => {
        console.log('disconnected');
      }
    });
  }

  async connect(token: string, guid: string) {
    if (this.cable) {
      return;
    }

    const socketHostUrl = environment.socketHost + '?access_token=' + token.split(' ')[1] + '&guid=' + guid;

    this.cable = createConsumer(socketHostUrl);

    this.subscribeInvitations(guid);
  }

  async disconnect() {
    if (!this.cable) {
      return;
    }

    this.cable.disconnect();
    this.cable = null;
  }
}
