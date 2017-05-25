angular.module('bhima.controllers')
  .controller('CashDashboardController', CashDashboardController);

// DI
CashDashboardController.$inject = [
  'CashService', 'PeriodService', 'NotifyService', '$scope',
];

// Controller definition
function CashDashboardController(Cash, Periods, Notify, $scope) {
  var vm = this;

  // global variables
  vm.defaultPeriodKey = 'today';

  // bind methods
  vm.onSelectPeriod = onSelectPeriod;

  // on select period handler
  function onSelectPeriod(period) {
    vm.period = period;
    loadStats(vm.period);
  }

  // on startup
  function startup() {
    vm.period = Periods.definition(vm.defaultPeriodKey);
    loadStats(vm.period);
  }

  function loadStats(period) {
    var params = getPeriodParameters(period);
    vm.loading = true;
    Cash.dashboard.read(null, params)
      .then(function (result) {
        $scope.$broadcast('data-received', result);
      })
      .catch(Notify.handleError)
      .finally(function () {
        vm.loading = false;
      });
  }

  /**
   * @function getPeriodParameters
   * @param {object} period
   */
  function getPeriodParameters(period) {
    if (period.key !== 'custom') {
      return { period : period.key };
    }
    return {
      period : 'custom',
      custom_period_start : period.customPeriodStart,
      custom_period_end : period.customPeriodEnd,
    };
  }

  startup();
}
