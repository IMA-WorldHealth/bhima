angular.module('bhima.controllers')
.controller('ReportDepotDistributionsController', ReportDepotDistributionsController);

ReportDepotDistributionsController.$inject = [
  '$http', '$window', '$translate', 'DateService'
];

/**
* Report on Depot Distributions by any type
*
* This report furnishes the user with the total distributions of any
* depot in the enterprise, filtered on distribution type.  The distribution type
* can be 'service', 'patients', 'loss' or 'rummage'.
*/
function ReportDepotDistributionsController($http, $window, $translate, Dates) {
  var vm = this;

  vm.state = 'default';

  // periods -- TODO this should be in a service
  vm.periods = [{
    key : 'CASH_PAYMENTS.DAY',
    method : today
  }, {
    key : 'CASH_PAYMENTS.WEEK',
    method : week
  }, {
    key : 'CASH_PAYMENTS.MONTH',
    method : month
  }];

  // types of distributions
  vm.types = [{
    key  : $translate.instant('DEPOT.DISTRIBUTION.PATIENTS'),
    name : 'patients',
    href : 'partials/reports/distributions/templates/patients.html'
  },{
    key  : $translate.instant('DEPOT.DISTRIBUTION.SERVICES'),
    name : 'services',
    href : 'partials/reports/distributions/templates/services.html'
  },{
    key  : $translate.instant('DEPOT.DISTRIBUTION.LOSSES'),
    name : 'losses',
    href : 'partials/reports/distributions/templates/losses.html'
  },{
    key  : $translate.instant('DEPOT.DISTRIBUTION.RUMMAGE'),
    name : 'rummage',
    href : 'partials/reports/distributions/templates/rummages.html'
  }];

  // bind controller methods to view
  vm.select = select;
  vm.reset = reset;
  vm.reconfigure = reconfigure;
  vm.generate = generate;
  vm.print = function () { $window.print(); };

  // startup the module
  startup();

  /* ------------------------------------------------------------------------ */

  function startup() {

    // load depots
    $http.get('/depots')
    .then(function (response) {
      vm.depots = response.data;
    });

    select(vm.periods[0]);
  }

  function select(period) {
    vm.selected = period;
    period.method();
  }

  function reset() {
    vm.loading = true;

    $http.get('/depots/' + vm.depot.uuid + '/distributions', {
      params : {
        type : vm.type.name,
        start : Dates.util.str(vm.start),
        end : Dates.util.str(vm.end)
      }
    })
    .then(function (response) {
      vm.distributions = response.data;
      console.log('loaded:', vm.distributions);
    })
    .catch(function (error) {
      console.log('An error occured!', error);
    })
    .finally(function () {
      vm.loading = false;
    });
  }

  function today() {
    vm.start = Dates.current.day();
    vm.end = Dates.next.day();
  }

  function week() {
    vm.start = Dates.current.week();
    vm.end = Dates.current.day();
  }

  function month() {
    vm.start = Dates.current.month();
    vm.end = Dates.current.day();
  }

  function generate() {
    vm.state = 'generate';
    reset();
  }

  function reconfigure() {
    vm.state = 'default';
  }
}
