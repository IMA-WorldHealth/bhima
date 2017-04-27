angular.module('bhima.controllers')
.controller('DashboardPatientController', DashboardPatientController);

DashboardPatientController.$inject = ['DashboardService', 'NotifyService'];

function DashboardPatientController(Dashboard, Notify) {
  var vm = this;

  Dashboard.patients()
    .then(function (result) {
      vm.stats = result;
    })
    .catch(Notify.handleError);
}
