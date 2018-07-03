angular.module('bhima.controllers')
  .controller('employeeStandingController', EmployeeStandingController);

EmployeeStandingController.$inject = [
  '$state', '$sce', 'NotifyService', 'BaseReportService', 'AppCache',
  'BaseReportService', 'reportData',
];

/**
 * @function EmployeeStandingController
 *
 * @description

 */
function EmployeeStandingController($state, $sce, Notify, BaseReportService, AppCache, SavedReports, reportData) {

  const vm = this;
  const cache = new AppCache('configure_employeeStanding');
  const reportUrl = '/reports/finance/employeeStanding';

  vm.reportDetails = {};

  checkCachedConfiguration();

  // custom filter employee_uuid
  vm.onSelectEmployee = function onSelectEmployee(employee) {
    vm.reportDetails.employee_uuid = employee.uuid;
  };

  vm.requestSaveAs = function requestSaveAs() {
    const options = {
      url : reportUrl,
      report : reportData,
      reportOptions : angular.copy(vm.reportDetails),
    };

    return SavedReports.saveAsModal(options)
      .then(() => {
        $state.go('reportsBase.reportsArchive', { key : options.report.report_key });
      })
      .catch(Notify.handleError);
  };

  vm.preview = function preview(form) {
    if (form.$invalid) { return 0; }

    // update cached configuration
    cache.reportDetails = angular.copy(vm.reportDetails);

    return SavedReports.requestPreview(reportUrl, reportData.id, angular.copy(vm.reportDetails))
      .then(result => {
        vm.previewGenerated = true;
        vm.previewResult = $sce.trustAsHtml(result);
      })
      .catch(Notify.handleError);
  };

  vm.clearPreview = function clearPreview() {
    vm.previewGenerated = false;
    vm.previewResult = null;
  };

  function checkCachedConfiguration() {
    if (cache.reportDetails) {
      vm.reportDetails = angular.copy(cache.reportDetails);
    }
  }
}
