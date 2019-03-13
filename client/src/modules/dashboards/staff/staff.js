angular.module('bhima.controllers')
  .controller('StaffDashboardController', StaffDashboardController);

function StaffDashboardController() {
  const vm = this;
  vm.search = { date : new Date() };

  vm.onChangeFilter = selected => {
    vm.selected = selected;
  };
}
