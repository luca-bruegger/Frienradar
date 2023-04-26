import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { AccountState } from '../account';
import { ApiService } from '../../service/api.service';
import { catchError, tap } from 'rxjs/operators';
import { UserRelation } from '../contact';

interface NearbyUserData {
  0: string[];
  1: string[];
  2: string[];
  3: string[];
}

/* State Model */
@Injectable()
export class LocationStateModel {
  geohash: string;
  nearbyUsers: NearbyUserData;
}

export namespace Location {
  /** Actions */
  export class UpdatePosition {
    static readonly type = '[Location] UpdatePosition';

    constructor(
      public geohash: string
    ) {
    }
  }

  export class FetchNearbyUsers {
    static readonly type = '[Location] Fetch Nearby Users';

    constructor(
      public payload: {
        page: number;
        append: boolean;
        distance: number;
      }
    ) {
    }
  }
}

@State<LocationStateModel>({
  name: 'location',
  defaults: {
    geohash: null,
    nearbyUsers: {
      0: null,
      1: null,
      2: null,
      3: null
    }
  }
})

@Injectable()
export class LocationState {
  constructor(private store: Store,
              private apiService: ApiService) {
  }

  @Selector()
  static geohash(state: LocationStateModel) {
    return state.geohash;
  }

  @Selector()
  static nearbyUsers(state: LocationStateModel) {
    return state.nearbyUsers;
  }

  @Selector()
  static eightHoursAgo() {
    const EIGHT_HOURS = 1000 * 60 * 60 * 8;
    const eightHoursAgo = new Date(Date.now() - EIGHT_HOURS);

    return eightHoursAgo.toISOString();
  }

  @Action(Location.UpdatePosition)
  async updatePosition(
    {patchState, dispatch}: StateContext<LocationStateModel>,
    action: Location.UpdatePosition
  ) {
    let geohash = action.geohash;
    const user = this.store.selectSnapshot(AccountState.user);

    return this.apiService.put('/geolocations/' + user.geolocation_id, {
      geohash
    }).pipe(tap((response: any) => {
      geohash = response.data.geohash;

      patchState({
        geohash
      });
    }), catchError((error: any) => {
      console.log(error);
      return error;
    }));
  }

  @Action(Location.FetchNearbyUsers)
  async nearbyUsers({
                      patchState,
                      dispatch
                    }: StateContext<LocationStateModel>, action: Location.FetchNearbyUsers) {
    const { page, append, distance } = action.payload;
    return this.apiService.get(`/nearby_users?page=${page}&distance=${distance}`).pipe(tap(async (response: any) => {
      const users = JSON.parse(response).data;

      await dispatch(new UserRelation.FetchFriends({ page: 1}));
      await dispatch(new UserRelation.FetchInvitations({ page: 1}));
      await dispatch(new UserRelation.FetchFriendRequests());

      const nearbyUsers = { ...this.store.selectSnapshot(LocationState.nearbyUsers) };

      if (append) {
        nearbyUsers[distance] = nearbyUsers[distance].concat(users);
      } else {
        nearbyUsers[distance] = users;
      }

      patchState({
        nearbyUsers
      });
    }), catchError(async (error) => {
      console.log(error);
      return error;
    }));
  }

}
