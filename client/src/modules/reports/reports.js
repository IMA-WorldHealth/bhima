angular.module('bhima.controllers')
  .controller('ReportsController', ReportsController);

ReportsController.$inject = [
  '$state', 'NotifyService', 'reportData',
];

function ReportsController($state, Notify, reportData) {
  var vm = this;
  var archiveState = 'reportsBase.reportsArchive';

  vm.report = reportData;
  vm.isArchive = isArchive;

  function isArchive() {
    return $state.current.name === archiveState;
  }
}
