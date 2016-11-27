angular.module('bhima.controllers')
.controller('DashboardDebtorController', DashboardDebtorController);

DashboardDebtorController.$inject = ['DashboardService'];

function DashboardDebtorController(Dashboard) {
  var vm = this;

  // @TODO move to service to deal with assigning application colours
  vm.darkBlueGradient = ['#085484', '#3a6893', '#597ba2', '#7490b1', '#90a5c0', '#abbbd0',
    '#c7d1df', '#e3e8ef', '#ffffff'];

  vm.owedGraph = {
    colors : vm.darkBlueGradient,
    options : {
      legend : {
        display : true
      }
    }
  };

  Dashboard.debtors()
    .then(function (result) {
      var debtorGroups = result.data.debtors;
      vm.reportCached = result.timeCached;

      vm.owedGraph.data = debtorGroups.map(function (group) {
        return group.total;
      });
      vm.owedGraph.labels = debtorGroups.map(function (group) {
        return group.name;
      });

      // server will not pass aggregates object if there have been no transactions
      // (or if there are no debtor groups), this case is handled
      if (!result.data.aggregates) {
        vm.noDebt = true;
        return;
      }

      vm.noDebt = result.data.aggregates.total === 0;
    });
}
