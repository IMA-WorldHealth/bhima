angular.module('bhima.controllers')
  .controller('ReportsController', ReportsController);

ReportsController.$inject = [
  '$state', 'reportData',
];

function ReportsController($state, reportData) {
  var vm = this;
  var archiveState = 'reportsBase.reportsArchive';

  vm.report = reportData;
  vm.isArchive = isArchive;

  function isArchive() {
    return $state.current.name === archiveState;
  }
}
