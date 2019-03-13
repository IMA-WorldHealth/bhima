angular.module('bhima.controllers')
  .controller('FinanceDashboardController', FinanceDashboardController);

function FinanceDashboardController() {
  const vm = this;
  vm.search = { date : new Date() };

  vm.onChangeFilter = selected => {
    vm.selected = selected;
  };
}
