import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { GlobalActions } from '../global';
import { Appwrite } from '../../helpers/appwrite';
import { AccountState } from '../account';
import { Account as AccountModel } from '../../model/account';
import { Permission, Role } from 'appwrite';
import { GeohashDistance } from '../../component/radar-display/radar-display.component';

/* State Model */
@Injectable()
export class LocationStateModel {
  geohash: string;
  lessPreciseGeohash: string;
  name: string;
  profilePicture: string;
}

/* State Model */
@Injectable()
export class NearbyUserStateModel {
  close: [];
  nearby: [];
  remote: [];
  farAway: [];
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

  export class FetchLastLocation {
    static readonly type = '[Location] FetchLastLocation';

    constructor(
      public payload: { user: AccountModel.User; }
    ) {
    }
  }

  export class FetchNearbyUser {
    static readonly type = '[Location] FetchNearbyUser';

    constructor(
      public payload: {
        distance: GeohashDistance;
        geohash: string;
      }
    ) {
    }
  }
}

@State<LocationStateModel>({
  name: 'location',
  defaults: {
    geohash: null,
    lessPreciseGeohash: null,
    name: null,
    profilePicture: null
  }
})

@State<NearbyUserStateModel>({
  name: 'nearbyUsers',
  defaults: {
    close: [],
    nearby: [],
    remote: [],
    farAway: []
  }
})

@Injectable()
export class LocationState {
  geolocationOptions = {
    enableHighAccuracy: false,
    maximumAge: 10000,
    timeout: 10000
  };

  constructor(private store: Store) {
  }

  @Selector()
  static geohash(state: LocationStateModel) {
    return state.geohash;
  }

  @Selector()
  static eightHoursAgo() {
    const EIGHT_HOURS = 1000 * 60 * 60 * 8;
    const eightHoursAgo = new Date(Date.now() - EIGHT_HOURS);

    return eightHoursAgo.toISOString();
  }

  @Action(Location.FetchLastLocation)
  async fetchLastLocation(
    {patchState, dispatch}: StateContext<LocationStateModel>,
    action: Location.FetchLastLocation
  ) {
    let {user} = action.payload;
    try {
      const location = await Appwrite.databasesProvider().getDocument('radar', 'geolocations', user.$id);
      patchState({
        geohash: location.geohash,
        name: user.name,
        profilePicture: user.profilePicture
      });
    } catch (e: any) {
      try {
        // Create new document if not exists
        await Appwrite.databasesProvider().createDocument('radar', 'geolocations', user.$id, {
          geohash: "",
          name: "",
          profilePicture: ""
        }, [
          Permission.read(Role.users()),
          Permission.delete(Role.user(user.$id)),
          Permission.write(Role.user(user.$id))
        ]);
      } catch (e: any) {
        dispatch(
          new GlobalActions.showToast({
            error: e,
            color: 'danger',
          })
        );
      }
    }
  }

  @Action(Location.UpdatePosition)
  async updatePosition(
    {patchState, dispatch}: StateContext<LocationStateModel>,
    action: Location.UpdatePosition
  ) {
    let geohash = action.geohash;
    const currentGeohash = this.store.selectSnapshot(LocationState.geohash);

    // Only update if geohash changed
    if (currentGeohash === geohash) {
      return;
    }

    const user = this.store.selectSnapshot(AccountState.user);

    if (user && !user.$id) {
      return;
    }

    try {
      const data = {
        geohash,
        name: user.name,
        profilePicture: user.profilePicture
      };

      await Appwrite.databasesProvider().updateDocument('radar', 'geolocations', user.$id, data, [
        Permission.read(Role.users()),
        Permission.delete(Role.user(user.$id)),
        Permission.write(Role.user(user.$id))
      ]);
      patchState(data);
    } catch (e: any) {
      dispatch(
        new GlobalActions.showToast({
          error: e,
          color: 'danger',
        })
      );
    }
  }

  @Action(Location.FetchNearbyUser)
  async fetchNearbyUser(
    {patchState, dispatch}: StateContext<LocationStateModel>,
    action: Location.FetchNearbyUser
  ) {
    console.log(action.payload);
    const userId = this.store.selectSnapshot(AccountState.user).$id;

    try {

      return 'test';
    } catch (e: any) {
      dispatch(
        new GlobalActions.showToast({
          error: e,
          color: 'danger',
        })
      );
    }
  }
}
