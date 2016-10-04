// Ionic Starter App

angular.module('app', [
  'ionic',
  'ngCordova',
  'angularMoment',
  'LocalStorageModule',
  'app.controllers',
  'app.routes',
  'app.directives',
  'app.services'
])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)

    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})
.config(function (localStorageServiceProvider) {
  localStorageServiceProvider
  .setPrefix('ect');
}).constant('ApiEndpoint', {
  // Debug.
  url: 'http://compinta.com',
  // Production.
  //url: 'https://webgate.ec.europa.eu/fpfis/timeclock'
});
