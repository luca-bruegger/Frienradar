import { Injectable, NgZone } from '@angular/core';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { GlobalActions } from '../global';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { catchError, tap } from 'rxjs/operators';
import { ApiService } from '../../service/api.service';

/* State Model */
@Injectable()
export class UserRelationStateModel {
  receivedFriendRequests: any[];
  requestedFriends: string[];
  friends: any[];
}

export namespace UserRelation {
  /** Actions */
  export class FetchInvitations {
    static readonly type = '[UserRelation] Fetch Invitations';

    constructor(public payload: { page: number }) {
    }
  }

  export class Request {
    static readonly type = '[UserRelation] Request';

    constructor(public payload: { friendId: string }) {
    }
  }

  export class AppendFriendRequest {
    static readonly type = '[UserRelation] Append Friend Request';

    constructor(public payload: { invitation: any }) {
    }
  }

  export class AppendRequestedFriend {
    static readonly type = '[UserRelation] Append Requested Friend';

    constructor(public payload: { userGuid: string }) {
    }
  }

  export class RemoveFriendRequest {
    static readonly type = '[UserRelation] Remove Friend Request';

    constructor(public payload: { userGuid: string }) {
    }
  }

  export class FetchFriends {
    static readonly type = '[UserRelation] Fetch Friends';

    constructor(public payload: { page: number }) {
    }
  }

  export class FetchFriendRequests {
    static readonly type = '[UserRelation] Fetch Friend Requests';

    constructor() {
    }
  }

  export class RejectInvitation {
    static readonly type = '[UserRelation] Reject Invitation';

    constructor(public payload: { invitationId: string }) {
    }
  }

  export class AcceptInvitation {
    static readonly type = '[UserRelation] Accept Invitation';

    constructor(public payload: { invitationId: string }) {
    }
  }

  export class AddFriend {
    static readonly type = '[UserRelation] Add Friend';

    constructor(public payload: { username: string; profile_picture: string; id: string }) {}
  }

  export class ResetState {
    static readonly type = '[UserRelation] Reset State';

  }
}

@State<UserRelationStateModel>({
  name: 'userRelation',
  defaults: {
    receivedFriendRequests: null,
    requestedFriends: null,
    friends: []
  }
})

@Injectable()
export class UserRelationState {
  constructor(private navController: NavController,
              private ngZone: NgZone,
              private store: Store,
              private apiService: ApiService,
              private router: Router) {
  }

  @Selector()
  static receivedFriendRequests(state: UserRelationStateModel) {
    return state.receivedFriendRequests;
  }

  @Selector()
  static requestedFriends(state: UserRelationStateModel) {
    return state.requestedFriends;
  }

  @Selector()
  static friends(state: UserRelationStateModel) {
    return state.friends;
  }

  @Action(UserRelation.FetchFriendRequests)
  async fetchFriendRequests(
    {patchState, dispatch}: StateContext<UserRelationStateModel>,
    action: UserRelation.FetchFriendRequests
  ) {
    return this.apiService.get('/invitations').pipe(tap(async (response: any) => {
      const data = JSON.parse(response).data;
      const invitations = data.map((item) => item.attributes);

      patchState({
          receivedFriendRequests: invitations
        }
      );
    }), catchError(async (error) => {
      console.log(error);
    }));
  }

  @Action(UserRelation.FetchInvitations)
  async fetchInvitations(
    {patchState, dispatch}: StateContext<UserRelationStateModel>,
    action: UserRelation.FetchInvitations
  ) {
    const {page} = action.payload;
    return this.apiService.get(`/requested_users?page=${page}`).pipe(tap(async (response: any) => {
      const requestedFriends = JSON.parse(response).data.map((item) => item.id);

      patchState({
        requestedFriends
      });
    }), catchError(async (error) => {
      console.log(error);
    }));
  }

  @Action(UserRelation.AppendFriendRequest)
  async appendFriendRequest(
    {patchState, dispatch}: StateContext<UserRelationStateModel>,
    action: UserRelation.AppendFriendRequest
  ) {
    const {invitation} = action.payload;
    const requests = [...this.store.selectSnapshot(UserRelationState.receivedFriendRequests), invitation];

    patchState({
      receivedFriendRequests: requests
    });
  }

  @Action(UserRelation.AppendRequestedFriend)
  async appendRequestedFriend(
    {patchState, dispatch}: StateContext<UserRelationStateModel>,
    action: UserRelation.AppendRequestedFriend
  ) {
    const {userGuid} = action.payload;
    const requestedFriends = [...this.store.selectSnapshot(UserRelationState.requestedFriends), userGuid];

    patchState({
      requestedFriends
    });
  }

  @Action(UserRelation.RemoveFriendRequest)
  async removeFriendRequest(
    {patchState, dispatch}: StateContext<UserRelationStateModel>,
    action: UserRelation.RemoveFriendRequest
  ) {
    const {userGuid} = action.payload;
    const requestedFriends = this.store.selectSnapshot(UserRelationState.requestedFriends).filter((item) => item !== userGuid);

    patchState({
      requestedFriends
    });
  }

  @Action(UserRelation.Request)
  async request(
    {patchState, dispatch}: StateContext<UserRelationStateModel>,
    action: UserRelation.Request
  ) {
    const {friendId} = action.payload;
    const data = {
      invitation: {
        friend_id: friendId
      }
    };

    return this.apiService.post('/invitations', data).toPromise().then(async (response) => {
      console.log(response);
    }).catch(async (error) => {
      dispatch(new GlobalActions.HandleError({error}));
      console.log(error);
    });
  }

  @Action(UserRelation.RejectInvitation)
  async rejectInvitation(
    {patchState, dispatch}: StateContext<UserRelationStateModel>,
    action: UserRelation.RejectInvitation
  ) {
    const {invitationId} = action.payload;

    return this.apiService.delete(`/invitations/${invitationId}`).pipe(tap(() => {
      const invitations = this.store.selectSnapshot(UserRelationState.receivedFriendRequests);
      const filteredInvitations = invitations.filter((invitation) => invitation.id !== invitationId);

      patchState({
        receivedFriendRequests: filteredInvitations
      });
    }), catchError(async (error) => {
      console.log(error);
    }));
  }

  @Action(UserRelation.AcceptInvitation)
  async acceptInvitation(
    {patchState, dispatch}: StateContext<UserRelationStateModel>,
    action: UserRelation.AcceptInvitation
  ) {
    const {invitationId} = action.payload;

    return this.apiService.put('/invitations/accept', {
      id: invitationId
    }).pipe(tap(async (response: any) => {
      const { id, username, profile_picture } = response.data;
      const friendRequests = this.store.selectSnapshot(UserRelationState.receivedFriendRequests).filter((item) => item.sender_id != id);
      console.log(friendRequests);
      patchState({
        receivedFriendRequests: friendRequests
      });

      dispatch(new UserRelation.AddFriend({
        id,
        username,
        profile_picture
      }));

      dispatch(new GlobalActions.ShowToast({
        message: 'Du bist nun befreundet mit ' + username,
        color: 'success'
      }));
    }), catchError(async (error) => {
      console.log(error);
    }));
  }

  @Action(UserRelation.AddFriend)
  async addFriend(
    {patchState, dispatch}: StateContext<UserRelationStateModel>,
    action: UserRelation.AddFriend
  ) {
    const { username, profile_picture, id} = action.payload;

    const friends = [...this.store.selectSnapshot(UserRelationState.friends) || [], {
      username,
      profile_picture,
      id
    }];

    patchState({
      friends
    });
  }

  @Action(UserRelation.FetchFriends)
  async fetchFriends(
    {patchState, dispatch}: StateContext<UserRelationStateModel>,
    action: UserRelation.FetchFriends
  ) {
    const {page} = action.payload;
    return this.apiService.get(`/friends?page=${page}`).pipe(tap(async (response: any) => {
      const friends = JSON.parse(response).data.map((item) => item.attributes);

      patchState({
        friends
      });
    }), catchError(async (error) => {
      console.log(error);
    }));
  }

  @Action(UserRelation.ResetState)
  async resetState(
    {patchState, dispatch}: StateContext<UserRelationStateModel>,
    action: UserRelation.FetchFriends
  ) {
    patchState({
      receivedFriendRequests: null,
      requestedFriends: null,
      friends: []
    });
  }
}
