angular.module('bhima.controllers')
  .controller('ReportsController', ReportsController);

ReportsController.$inject = [
  '$state', 'reportData', '$scope', 'BaseReportService',
];

function ReportsController($state, reportData, $scope, SavedReports) {
  const vm = this;
  const archiveState = 'reportsBase.reportsArchive';

  vm.report = reportData;
  vm.isArchive = isArchive;

  function isArchive() {
    return $state.current.name === archiveState;
  }

  function refreshReportData() {
    SavedReports.requestKey($state.params.key)
      .then((results) => {
        [vm.report] = results;
      });
  }

  // FIXME(@jniles): this is a hack to get the state to refresh the top level data
  // without changing the way states are defined.  Since the top level state never
  // changes, the only effective way to communicate between states is to either:
  //  1) Have a service share the data (this would require changing a ton of files)
  //  2) Have an event trigger the refresh (much easier, implemented here)
  $scope.$on('$stateChangeSuccess', () => {
    refreshReportData();
  });
}
