angular.module('bhima.controllers')
  .controller('HospitalizationDashboardController', HospitalizationDashboardController);

function HospitalizationDashboardController() {
  const vm = this;
  vm.search = { date : new Date() };

  vm.onChangeFilter = selected => {
    console.log('selected : ', selected);
  };
}
