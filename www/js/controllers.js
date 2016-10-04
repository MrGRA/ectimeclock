angular.module('app.controllers', [])

.controller('eCTimeClockCtrl', [
  '$scope',
  '$stateParams',
  '$ionicPlatform',
  '$timeout',
  '$filter',
  '$interval',
  'ConnectivityMonitor',
  'callService',
  'localStorageService',
  'workService',
  'moment',
  function (
    $scope,
    $stateParams,
    $ionicPlatform,
    $timeout,
    $filter,
    $interval,
    ConnectivityMonitor,
    callService,
    localStorageService,
    workService,
    moment
  ){
    var vm = this;
    vm.isOnline = true;
    vm.hasSettings = true;
    vm.workinkDay = {};
    vm.msg = '';
    vm.error = '';

    var timerPromise;
    var goHomeMessageShown = false;

    // Initialize the database.
    $ionicPlatform.ready(function() {
      ConnectivityMonitor.startWatching();
      if (!ConnectivityMonitor.isOnline()) {
        vm.isOnline = false;
      }

      vm.workinkDay = workService.getWorkingDay();
      if (vm.workinkDay.in && vm.workinkDay.out) {
        vm.logged = false;
        _showMessage('Day already Logged!');
      }

      if (vm.workinkDay.in && !vm.workinkDay.out) {
        vm.logged = true;
        startTimer();
      }
    });

    // Monitor the network connection.
    $scope.$on('connectionChanged', function(e, status) {
      vm.isOnline = status;
      $scope.$apply();
    });

    vm.login = function() {
      var settings = localStorageService.get('settings');
      if (!settings) {
        _showError('Please fill in your settings!');
        return false;
      }

      // Add a note, if any.
      settings.note = vm.noteIn? vm.noteIn: '';

      // Lets login.
      callService.accessServer(true, settings)
      .then(function (r) {
          vm.workinkDay = {
            note_in   : settings.note,
            in        : _getNow(),
            out       : false,
            note_out  : false,
            totalHours: '00:00:00'
          };

          workService.setWorkingDay(vm.workinkDay);
          startTimer();
          vm.logged = true;
          vm.noteIn = null;
          settings.note = null;
        },
        function (error) {
          vm.logged = false;
          _showError(error);
        });
    };

    vm.logout = function () {
      var settings = localStorageService.get('settings');
      if (!settings) {
        _showError('Please fill in your settings!');
        return false;
      }

      // Add a note, if any.
      settings.note = vm.noteOut? vm.noteOut: '';

      // Lets logout.
      callService.accessServer(false, settings)
      .then(function () {
          console.log(vm.clock);
          vm.workinkDay.totalHours = vm.clock;
          stopTimer();
          vm.workinkDay.note_out = settings.note;
          vm.workinkDay.out = _getNow();
          workService.setWorkingDay(vm.workinkDay);
          vm.noteOut = null;
          settings.note = null;
          vm.logged = false;
          vm.msg = null;
        },
        function (error) {
          vm.logged = true;
          _showError(error);
        });
    };

    function _getNow() {
      return moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    }

    function timediff( ) {

      var now = moment(new Date());
      var then = moment(vm.workinkDay.in);

      var d = moment.duration(now.diff(then));
      var difference_ms = d.asMilliseconds();
      //take out milliseconds
      difference_ms = difference_ms/1000;
      var seconds = Math.floor(difference_ms % 60);
      difference_ms = difference_ms/60;
      var minutes = Math.floor(difference_ms % 60);
      difference_ms = difference_ms/60;
      var hours = Math.floor(difference_ms % 24);

      if (hours < 10) hours = '0' + hours;
      if (minutes < 10) minutes = '0' + minutes;
      if (seconds < 10) seconds = '0' + seconds;

      return {
        forClock: hours + ':' + minutes + ':' + seconds,
        milliseconds: d.asMilliseconds()
      };
    }

    // starts the interval
    function startTimer() {
      // stops any running interval to avoid two intervals running at the same time
      stopTimer();
      // store the interval promise
      timerPromise = $interval(function(){
        var timerObject = timediff();
        vm.clock = timerObject.forClock;
        isWorkingDayComplete(timerObject.milliseconds);
      }, 1000);
    }

    function stopTimer() {
      $interval.cancel(timerPromise);
      vm.clock = '00:00:00';
    }

    function isWorkingDayComplete(milliseconds) {
      var oneWorkingDay = 1000*60*60*8.5; //8h 30m
      if (oneWorkingDay <= milliseconds && !goHomeMessageShown) {
        vm.msg = 'You are overworking, go Home!';
        goHomeMessageShown = true;
      }
    }

    function _showError(msg) {
      vm.error = msg;
      $timeout(function() {
        vm.error = '';
      }, 3000);
    }

    function _showMessage(msg) {
      vm.msg = msg;
      $timeout(function() {
        vm.msg = '';
      }, 3000);
    }
  }])

.controller('settingsCtrl', ['localStorageService', function (localStorageService) {

    var vm = this;
    vm.user = localStorageService.get('settings');

    vm.saveSettings = function() {
      localStorageService.set('settings', vm.user);
    };

  }])

.controller('helpCtrl', ['localStorageService', function (localStorageService) {
  var vm = this;

  vm.cleanDB = function() {
    localStorageService.clearAll();
  }

}]);
    