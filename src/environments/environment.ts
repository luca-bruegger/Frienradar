// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  beta: false,
  test: false,
  apiUrl: 'http://192.168.1.148:3000',
  mapsKey: 'AIzaSyBzaHPkOpQSETE6Q9RsIbKFL_LOL_f7xCU',
  oneSignalAppId: 'dbcfaa41-2e99-498a-8293-a3020ac85b2c',
  iosAdId: 'ca-app-pub-6953123179903035/3049634317',
  androidAdId: 'ca-app-pub-6953123179903035/9676252847',
  socketHost: 'ws://192.168.1.148:3000/cable',

  endpoint: 'https://dev.api.frienradar.com/v1',
  project: '633467240f7db9ae07d7',
  radarDatabaseId: 'radar',
  geolocationsCollectionId: 'geolocations',
  contactsCollectionId: 'contacts',
  appUrl: 'https://frienradar.com',
  googleAnalyticsId: '',
  usernameCollectionId: 'usernames',
  usersDatabaseId: 'users',
  accountsCollectionId: 'accounts',
  friendsCollectionId: 'friends',
  descriptionCollectionId: 'description',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
