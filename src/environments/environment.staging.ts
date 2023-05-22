// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  beta: true,
  test: false,
  apiUrl: 'https://staging.api.frienradar.com',
  iosAdId: 'ca-app-pub-6953123179903035/3049634317',
  androidAdId: 'ca-app-pub-6953123179903035/9676252847',
  mapsKey: 'AIzaSyBI6AT9M_Nz_Y-_Xpql_Q28twKOO0jzu_8',
  socketHost: 'wss://staging.api.frienradar.com/cable',
  deeplinkDomain: 'https://frienradar.com',
  googleAnalyticsId: 'G-G2452L0H7H',
  oneSignalAppId: 'dbcfaa41-2e99-498a-8293-a3020ac85b2c'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
