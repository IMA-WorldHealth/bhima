angular.module('bhima.controllers')
.controller(
  'DepotStockDistributionsController', DepotStockDistributionsController
);

DepotStockDistributionsController.$inject = [
  '$routeParams', '$http', 'util', 'DateService'
];

function DepotStockDistributionsController($routeParams, $http, util, Dates) {
  var vm = this;

  // expose models to view
  vm.loading = false;
  vm.depotId = $routeParams.depotId;
  vm.type    = $routeParams.type;
  vm.url     = '/partials/depots/reports/distributions/templates/' + vm.type + '.html';
  vm.title   = 'DEPOT.DISTRIBUTION.' + vm.type.toUpperCase();
  vm.select  = select;
  vm.fetch   = search;

  // TODO - better naming scheme, possibly a service or directive
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

  startup();

  /* ----------------------------------------------------------------------- */

  function select(period) {
    vm.selected = period;
    period.method();
  }

  function search() {
    var url;

    vm.loading = true;

    url = [
      '/depots/' + vm.depotId,
      '/distributions?type=' + vm.type,
      '&start=' + util.sqlDate(vm.startDate),
      '&end=' + util.sqlDate(vm.endDate)
    ].join('');

    $http.get(url)
    .then(function (response) {
      vm.data = response.data;
    })
    .catch(function (err) {
      console.log(err);
    })
    .finally(function () {
      vm.loading = false;
    });
  }

  function today() {
    vm.startDate = Dates.current.week();
    vm.endDate   = Dates.next.day();
    search();
  }

  function week() {
    vm.startDate = Dates.current.week();
    vm.endDate   = Dates.next.day();
    search();
  }

  function month() {
    vm.startDate = Dates.current.month();
    vm.endDate   = Dates.next.day();
    search();
  }

  function startup() {
    select(vm.periods[0]);
  }
}
