import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Store } from '@ngxs/store';
import { Consumer, createConsumer } from '@rails/actioncable';
import { GlobalActions, UserRelation } from '../store';
import { TranslocoService } from '@ngneat/transloco';

@Injectable({
  providedIn: 'root'
})
export class ActionCableService {
  private cable: Consumer = null;

  constructor(private store: Store,
              private translocoService: TranslocoService) {
  }

  get isCableConnected() {
    return this.cable && this.cable.connection.isOpen();
  }

  subscribeInvitations(userId: string) {
    this.cable.subscriptions.create({
      channel: 'InvitationsChannel',
      id: userId
    }, {
      connected: () => {
        console.log('connected');
      },
      received: (params) => {
        if (params.type === 'sent') {
          this.store.dispatch(new UserRelation.AppendRequestedFriend({ userGuid: params.data.friend_id }));
          this.showToast(this.translocoService.translate('action-cable.request-sent', { name: params.data.friend_username }));
        } else if (params.type === 'received') {
          this.store.dispatch(new UserRelation.AppendFriendRequest({ invitation: params.data }));
          this.showToast(this.translocoService.translate('action-cable.request-received', { name: params.data.sender_username }));
        } else if (params.type === 'accepted') {
          this.store.dispatch(new UserRelation.RemoveFriendRequest({ userGuid: params.data.friend_id }));
          this.store.dispatch(new UserRelation.AddFriend({
            id: params.data.id,
            username: params.data.username,
            profile_picture: params.data.profile_picture
          }));
          this.showToast(this.translocoService.translate('action-cable.request-accepted', { name: params.data.username }));
        } else if (params.type === 'rejected') {
          this.store.dispatch(new UserRelation.RemoveFriendRequest({ userGuid: params.data.friend_id }));
          this.showToast(this.translocoService.translate('action-cable.request-declined', { name: params.data.friend_username }), false);
        }
      },
      disconnected: () => {
        console.log('disconnected');
      }
    });
  }

  async connect(token: string, userId: string) {
    if (this.cable) {
      return;
    }

    const socketHostUrl = environment.socketHost + '?access_token=' + token.split(' ')[1];

    this.cable = createConsumer(socketHostUrl);

    this.subscribeInvitations(userId);
  }

  async disconnect() {
    if (!this.cable) {
      return;
    }

    this.cable.disconnect();
    this.cable = null;
  }

  private showToast(message, success = true) {
    this.store.dispatch(new GlobalActions.ShowToast({
      message,
      color: success ? 'success' : 'danger'
    }));
  }
}
