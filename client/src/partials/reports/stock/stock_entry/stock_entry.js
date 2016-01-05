angular.module('bhima.controllers')
.controller('ReportStockEntryController', ReportStockEntryController);

ReportStockEntryController.$inject = [
  '$http', '$window', '$location', 'DateService'
];

/**
  * This controller is responsible for display data relatives to a depot stock entry
  *
  * @controller ReportStockEntryController
  */
function ReportStockEntryController($http, $window, $location, Dates) {
  var vm = this,

  // we need to parse the query string, if provided
  qs = $location.search();

  // bind variables to scope
  vm.start = qs.start ? (qs.start === '00-00-0000' ? qs.start: new Date(qs.start)) : new Date();        // default: today
  vm.end = qs.end ? new Date(qs.end) :  new Date(); // default: today
  vm.loading = false;

  // bind methods
  vm.print = function () { $window.print(); };
  vm.search = search;
  vm.reconfigure = reconfigure;

  // startup the module
  initialise();

  /* ------------------------------------------------------------------------ */

  // performs the initial data requests
  function initialise() {
    getDepots()
    .then(function (data) {
      vm.depots = data;
    })
    .catch(handler);

    if (qs.start && qs.end) {
      vm.search();
    } else {
      vm.state = 'default';
    }
  }

  // generic error handler
  function handler(err) {
    console.error(err);
  }

  // downloads a list of depots from the server-side HTTP API.
  function getDepots() {
    return $http.get('/depots')
    .then(function (response) { return response.data; });
  }

  // search entry stock in depot
  function search() {

    // toggle loading
    vm.loading = true;

    var url   = '/stock/entries?',
        depot = (vm.depot) ? vm.depot.uuid : 'ALL';

    // fetch data from teh server
    $http.get(url, {
      params : {
        depot     : depot,
        confirmed : vm.confirmed,
        start     : Dates.util.str(vm.start),
        end       : Dates.util.str(vm.end)
      }
    })
    .then(function (response) {
      vm.stockEntries = response.data;
      vm.state = 'generate';
    })
    .catch(handler)
    .finally(function () {
      vm.loading = false;
    });
  }

  // trigger a reconfiguration of the report
  function reconfigure() {
    vm.state = 'default';

    // FIXME this is a hack
    // if we hacked in the 00-00-0000 date, reset it to a super small date
    if (vm.start === '00-00-0000') {
      vm.start = new Date('01-01-0100');
    }
  }
}
