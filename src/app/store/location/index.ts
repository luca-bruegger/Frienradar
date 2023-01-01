import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { GlobalActions } from '../global';
import { Appwrite } from '../../helper/appwrite';
import { AccountState } from '../account';
import { Account as AccountModel } from '../../model/account';
import { Permission, Query, Role } from 'appwrite';
import { environment } from '../../../environments/environment';
import { GeohashLength } from '../../component/element/radar-display/radar-display.component';

const emptyLocationData: LocationData = {
  close: '',
  nearby: '',
  remote: '',
  farAway: '',
  pictureBreaker: '',
  username: ''
};

interface LocationData {
  close: string;
  nearby: string;
  remote: string;
  farAway: string;
  pictureBreaker: string;
  username: string;
}

interface NearbyUserData {
  close: string[];
  nearby: string[];
  remote: string[];
  farAway: string[];
}

/* State Model */
@Injectable()
export class LocationStateModel {
  geolocation: LocationData;
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

  export class FetchLastLocation {
    static readonly type = '[Location] FetchLastLocation';

    constructor(
      public payload: { user: AccountModel.User }
    ) {
    }
  }

  export class FetchNearbyUser {
    static readonly type = '[Location] FetchNearbyUser';

    constructor(
      public payload: {
        geohashLength: GeohashLength;
        geohash: string;
      }
    ) {
    }
  }
}

@State<LocationStateModel>({
  name: 'location',
  defaults: {
    geolocation: emptyLocationData,
    nearbyUsers: {
      close: null,
      nearby: null,
      remote: null,
      farAway: null
    }
  }
})

@Injectable()
export class LocationState {
  constructor(private store: Store) {
  }

  @Selector()
  static geohash(state: LocationStateModel) {
    return state.geolocation.close;
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

  @Action(Location.FetchLastLocation)
  async fetchLastLocation(
    {patchState, dispatch}: StateContext<LocationStateModel>,
    action: Location.FetchLastLocation
  ) {
    const {user} = action.payload;
    try {
      const location = await Appwrite.databasesProvider().getDocument(
        environment.radarDatabaseId,
        environment.geolocationsCollectionId,
        user.$id);

      patchState({
        geolocation: location as unknown as LocationData
      });
    } catch (e: any) {
      if (e.type === 'document_not_found' && e.code === 404) {
        await this.initializeEmptyDocumentForUser(user.$id);
      } else {
        this.store.dispatch(new GlobalActions.HandleError({error: e as Error}));
      }
    }
  }

  @Action(Location.UpdatePosition)
  async updatePosition(
    {patchState, dispatch}: StateContext<LocationStateModel>,
    action: Location.UpdatePosition
  ) {
    const geohash = action.geohash;
    const currentGeohash = this.store.selectSnapshot(LocationState.geohash);
    const user = this.store.selectSnapshot(AccountState.user);

    // Only update if user is logged in
    if (!user) {
      return;
    }

    // Only update if geohash changed
    if (currentGeohash === geohash) {
      return;
    }

    const data: LocationData = this.locationDataFromGeohash(geohash, user);

    // Update location
    if (user && user.$id) {
      await this.updateUserLocation(user.$id, data);
      patchState({
        geolocation: data
      });
    }
  }

  @Action(Location.FetchNearbyUser)
  async fetchNearbyUser(
    {patchState, dispatch}: StateContext<LocationStateModel>,
    action: Location.FetchNearbyUser
  ) {
    const {geohashLength, geohash} = action.payload;

    // return if distance nor geohash is set
    if (!geohashLength || !geohash) {
      return;
    }

    const distanceStr = GeohashLength[geohashLength];
    const userId = this.store.selectSnapshot(AccountState.user).$id;
    const eightHoursAgo = this.store.selectSnapshot(LocationState.eightHoursAgo);
    const recentGeohash = this.store.selectSnapshot(LocationState.geohash);
    const nearbyUsers = this.store.selectSnapshot(LocationState.nearbyUsers);

    // Only fetch if geohash changed
    if (recentGeohash === geohash && !!nearbyUsers[distanceStr]) {
      return;
    }

    // Only fetch if distance has not yet been loaded
    if (!!nearbyUsers[distanceStr]) {
      return;
    }

    try {
      const users = [];
      await Appwrite.databasesProvider().listDocuments(environment.radarDatabaseId, environment.geolocationsCollectionId, [
        Query.equal(distanceStr, [geohash.substring(0, geohashLength)]),
        Query.greaterThan('$updatedAt', eightHoursAgo),
      ]).then(response => {
        response.documents.filter((document: any) => document.$id !== userId).forEach((document: any) => {
          users.push(document);
        });

        const data = {...nearbyUsers};
        data[distanceStr] = users;
        console.log('data', data);
        patchState({
          nearbyUsers: data
        });
      });
    } catch (e: any) {
      dispatch(new GlobalActions.HandleError({error: e as Error}));
    }
  }

  private async updateUserLocation(userId: string, data: LocationData) {
    try {
      return await Appwrite.databasesProvider().updateDocument(
        environment.radarDatabaseId,
        environment.geolocationsCollectionId,
        userId,
        data
      );
    } catch (e: any) {
      this.store.dispatch(new GlobalActions.HandleError({error: e as Error}));
    }
  }

  private locationDataFromGeohash(geohash: string, user: AccountModel.User): LocationData {
    return {
      close: geohash.substring(0, GeohashLength.close),
      nearby: geohash.substring(0, GeohashLength.nearby),
      remote: geohash.substring(0, GeohashLength.remote),
      farAway: geohash.substring(0, GeohashLength.farAway),
      username: user.username,
      pictureBreaker: user.pictureBreaker
    };
  }

  private async initializeEmptyDocumentForUser(userId: string) {
    try {
      await Appwrite.databasesProvider().createDocument(
        environment.radarDatabaseId,
        environment.geolocationsCollectionId,
        userId,
        emptyLocationData,
        [
          Permission.read(Role.users()),
          Permission.delete(Role.user(userId)),
          Permission.write(Role.user(userId))
        ]);
    } catch (e: any) {
      this.store.dispatch(new GlobalActions.HandleError({error: e as Error}));
    }
  }
}
