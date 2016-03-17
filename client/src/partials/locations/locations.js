// TODO Handle HTTP exception errors (displayed contextually on form)
angular.module('bhima.controllers')
.controller('LocationController', LocationController);

LocationController.$inject = [
  'LocationService'
];

function LocationController(locationService) {
  var vm = this;
  var session = vm.session = {};

  session.loading = false;  
  vm.view = 'default';

  function handler(error) {
    console.error(error);
  }

  // fired on startup
  function startup() {
    // start up loading indicator
    session.loading = true;

    // load location
    locationService.locations().then(function (data) {
      vm.locations = data;
      session.loading = false;
    }).catch(handler);

  }

  startup();
}
