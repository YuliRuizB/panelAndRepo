// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  mapbox: {
    accessToken: 'pk.eyJ1IjoiZXZhbGxnYXIiLCJhIjoiY2l1cnc2aDRxMDBiYzJ1cHZqdWFlODdseiJ9._lOalqIZflhz0YQosjx-zw'
  },
  firebaseConfig: {
   // QA - Nuevo
   
   apiKey: "AIzaSyB8bYTAOnFMYwTfHqkcRk6AjSDy1sP4j_I",
   authDomain: "appsand-a02f0.firebaseapp.com",
   projectId: "appsand-a02f0",
   storageBucket: "appsand-a02f0.appspot.com",
   messagingSenderId: "513522148143",
   appId: "1:513522148143:web:7f44f56470d5b8a2b8b7da",
   measurementId: "G-DN7R0ZLVL6"

  }
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
