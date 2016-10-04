angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
   .state('tabsController.eCTimeClock', {
    url: '/home',
    views: {
      'tab1': {
        templateUrl: 'templates/eCTimeClock.html',
        controller: 'eCTimeClockCtrl',
        controllerAs: 'vm'
      }
    }
  })

  .state('tabsController.settings', {
    url: '/settings',
    views: {
      'tab2': {
        templateUrl: 'templates/settings.html',
        controller: 'settingsCtrl',
        controllerAs: 'vm'
      }
    }
  })

  .state('tabsController.help', {
    url: '/help',
    views: {
      'tab3': {
        templateUrl: 'templates/help.html',
        controller: 'helpCtrl',
        controllerAs: 'vm'
      }
    }
  })

  .state('tabsController', {
    url: '/page1',
    templateUrl: 'templates/tabsController.html',
    abstract:true
  })

$urlRouterProvider.otherwise('/page1/home')

  

});