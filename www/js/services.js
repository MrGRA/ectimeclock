angular.module('app.services', [])

.factory('workService', ['localStorageService', 'moment', function (localStorageService, moment) {

  var workingDayModel = {
    in: false,
    note_in: false,
    out: false,
    note_out: false,
    totalHours: false
  };

  function _today() {
    return moment(new Date()).format('YYYY-MM-DD');
  }

  function setWorkingDay(workingday) {
    localStorageService.set(_today(), workingday);
  }

  function getWorkingDay() {
    var _tmp = localStorageService.get(_today());
    return _tmp? _tmp: workingDayModel;
  }

  return {
    getWorkingDay: getWorkingDay,
    setWorkingDay: setWorkingDay
  };

}])


.factory('callService', [
  '$http',
  '$q',
  'ApiEndpoint',
  function ($http, $q, ApiEndpoint) {

  function _verify(response) {
    var errorText = /You have entered the wrong password for/g;
    var noUserText = /Username is not in the database/g;
    var matchError = errorText.exec(response);
    var matchNoUser = noUserText.exec(response);

    return matchError || matchNoUser ? false: true;
  }

  function accessServer(isLogin, args) {
    //if no settings then fuck it :P
    if (!args) {
      return $q.reject('No Settings');
    }

    // Debug, should be in the config
    var url = ApiEndpoint.url + '/timeclock.php';

    var sendData = 'left_displayname=' + encodeURIComponent(args.name) +
      '&employee_passwd=' + args.password +
      '&left_inout=' + (isLogin? 'in': 'out') +
      '&left_notes=' + encodeURIComponent(args.note) +
      '&submit_button=Submit';

    var request = $http({
      method: 'POST',
      url: url,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      data: sendData
    });

    return $q(function(resolve, reject){
      request.then(
        function(response){
          _verify(response.data)? resolve(true): reject('Wrong Credentials, please review your settings!');
        },
        function(r){
          reject('Network Error!');
        });
    });
  }

  return {
    accessServer: accessServer
  };

}])

.factory('broadcastService', function($rootScope) {
  return {
    send: function(msg, data) {
      $rootScope.$broadcast(msg, data);
    }
  }
})

.factory('ConnectivityMonitor', function ($cordovaNetwork, $rootScope, broadcastService){

  function isOnline(){
    if(ionic.Platform.isWebView()){
      return $cordovaNetwork.isOnline();
    } else {
      return navigator.onLine;
    }
  }

  function startWatching() {
    if(ionic.Platform.isWebView()){
      $rootScope.$on('$cordovaNetwork:online', function(event, networkState){
        broadcastService.send('connectionChanged', true);
        console.log("went online");
      });

      $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
        broadcastService.send('connectionChanged', false);
        console.log("went offline");
      });
    }
    else {
      window.addEventListener("online", function(e) {
        broadcastService.send('connectionChanged', true);
        console.log("went online");
      }, false);

      window.addEventListener("offline", function(e) {
        broadcastService.send('connectionChanged', false);
        console.log("went offline");
      }, false);
    }
  }

  return {
    startWatching: startWatching,
    isOnline: isOnline
  };

});
