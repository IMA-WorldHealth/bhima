angular.module('bhima.controllers')
.controller('ReportStockExpirationsController', ReportStockExpirationsController);

ReportStockExpirationsController.$inject = [
  '$http', '$window', '$location', 'DateService'
];

/**
* This controller is responsible for display data on stock that will soon be
* expiring in our inventory.  The report is filterable by a specific depot if
* required.
*
* @controller ReportStockExpirationsController
*/
function ReportStockExpirationsController($http, $window, $location, Dates) {
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

    // TODO -- this could probably be made clearer.
    // execute the search if query string is defined
    if (qs.start && qs.end) {
      vm.search();
    } else {

      // FIXME -- normally, this would be the first thing declared.  However, ng-model's
      // dateFmt throws an error for 00-00-0000.  This is a work around
      vm.state = 'default';
    }
  }

  // generic error handler
  function handler(error) {
    console.log(error);
  }

  // downloads a list of depots from the server-side HTTP API.
  function getDepots() {
    return $http.get('/depots')
    .then(function (response) { return response.data; });
  }

  // fire off a search for matching drug expirations
  function search() {

    // toggle loading
    vm.loading = true;

    // if we have a depot defined, search on the depot.  Else,
    // search the entire inventory
    var url = vm.depot ?
      '/depots/' + vm.depot.uuid + '/expirations?' :
      '/inventory/expirations';

    // fetch data from teh server
    $http.get(url, {
      params : {
        start : Dates.util.str(vm.start),
        end   : Dates.util.str(vm.end)
      }
    })
    .then(function (response) {
      vm.expirations = response.data;
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
