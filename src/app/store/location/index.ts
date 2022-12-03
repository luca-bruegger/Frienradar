import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { GlobalActions } from '../global';
import { Appwrite } from '../../helpers/appwrite';
import { AccountState } from '../account';
import { Account as AccountModel } from '../../model/account';
import { Permission, Query, Role } from 'appwrite';
import { GeohashLength } from '../../component/radar-display/radar-display.component';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

interface LocationData {
  geohash: string;
  name: string;
  pictureBreaker: string;
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
  location: LocationData;
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
        distance: GeohashLength;
        geohash: string;
      }
    ) {
    }
  }
}

@State<LocationStateModel>({
  name: 'location',
  defaults: {
    location: {
      geohash: null,
      name: null,
      pictureBreaker: null
    },
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
  geolocationOptions = {
    enableHighAccuracy: false,
    maximumAge: 10000,
    timeout: 10000
  };

  constructor(private store: Store) {
  }

  @Selector()
  static geohash(state: LocationStateModel) {
    return state.location.geohash;
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
        `${user.$id}_${GeohashLength.close}`);
      patchState({
        location: {
          geohash: location.geohash,
          name: user.name,
          pictureBreaker: user.pictureBreaker
        }
      });
    } catch (e: any) {
      try {
        // Create new document if not exists
        await Appwrite.databasesProvider().createDocument(
          environment.radarDatabaseId,
          environment.geolocationsCollectionId,
          `${user.$id}_${GeohashLength.close}`,
          {
          geohash: '',
          name: '',
          pictureBreaker: ''
        }, [
          Permission.read(Role.users()),
          Permission.delete(Role.user(user.$id)),
          Permission.write(Role.user(user.$id))
        ]);
      } catch (e: any) {
        dispatch(
          new GlobalActions.ShowToast({
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
    const geohash = action.geohash;
    const currentGeohash = this.store.selectSnapshot(LocationState.geohash);
    const user = this.store.selectSnapshot(AccountState.user);

    // Only update if geohash changed
    if (currentGeohash === geohash) {
      return;
    }

    const data = {
      geohash,
      name: user.name,
      pictureBreaker: user.pictureBreaker
    };

    if (user && user.$id) {
      console.warn('User', user);
      await this.setGeohashesForUser(user.$id, geohash, data, dispatch);
    }

    data.geohash = geohash;
    patchState({
      location: data
    });
  }

  private async setGeohashesForUser($id: string, geohash: string, data: LocationData, dispatch: (actions: any) => Observable<void>) {
    const geohashLengths = [
      GeohashLength.close,
      GeohashLength.nearby,
      GeohashLength.remote,
      GeohashLength.farAway
    ];

    for (const length of geohashLengths) {
      data.geohash = geohash.substring(0, length);
      try {
        await Appwrite.databasesProvider().updateDocument(environment.radarDatabaseId, environment.geolocationsCollectionId, `${$id}_${length}`, data, [
          Permission.read(Role.users()),
          Permission.delete(Role.user($id)),
          Permission.write(Role.user($id))
        ]);
      } catch (e: any) {
        if (e.code === 404) {
          try {
            await Appwrite.databasesProvider().createDocument(environment.radarDatabaseId, environment.geolocationsCollectionId, `${$id}_${length}`, data, [
              Permission.read(Role.users()),
              Permission.delete(Role.user($id)),
              Permission.write(Role.user($id))
            ]);
          } catch (e: any) {
            dispatch(
              new GlobalActions.ShowToast({
                error: e,
                color: 'danger',
              })
            );
          }
        } else {
          dispatch(
            new GlobalActions.ShowToast({
              error: e,
              color: 'danger',
            })
          );
        }
      }
    }
  }

  @Action(Location.FetchNearbyUser)
  async fetchNearbyUser(
    {patchState, dispatch}: StateContext<LocationStateModel>,
    action: Location.FetchNearbyUser
  ) {
    const {distance, geohash} = action.payload;

    // return if distance nor geohash is set
    if (!distance || !geohash) {
      return;
    }

    const distanceStr = GeohashLength[distance];
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
        Query.equal('geohash', [geohash.substring(0, distance)]),
        Query.greaterThan('$updatedAt', eightHoursAgo),
      ]).then(response => {
        response.documents.filter((document: any) => {
          const documentId = document.$id.substring(0, document.$id.indexOf('_'));
          return documentId !== userId;
        }).forEach((document: any) => {
          const user = {...document};
          // remove distance suffix from id
          user.$id = user.$id.substring(0, user.$id.indexOf('_'));
          users.push(user);
        });

        const data = {...nearbyUsers};
        data[distanceStr] = users;

        patchState({
          nearbyUsers: data
        });
      });
    } catch (e: any) {
      dispatch(
        new GlobalActions.ShowToast({
          error: e,
          color: 'danger',
        })
      );
    }
  }
}
