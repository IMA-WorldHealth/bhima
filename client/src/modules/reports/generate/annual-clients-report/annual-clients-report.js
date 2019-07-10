angular.module('bhima.controllers')
  .controller('annual-clients-reportController', AnnualClientsReportController);

AnnualClientsReportController.$inject = [
  '$state', '$sce', 'NotifyService', 'AppCache', 'BaseReportService',
  'reportData', 'SessionService',
];

/**
 * @function AnnualClientsReportController
 *
 * @description
 * The debtor balance report provides a view of the current balance of each
 * debtor group in the enterprise.  It is slightly easier to use than the aged
 * debtors report, but contains the same information, sans aging.
 */
function AnnualClientsReportController($state, $sce, Notify, AppCache, SavedReports, reportData, Session) {
  const vm = this;
  const cache = new AppCache('configure_clients');
  const reportUrl = 'reports/finance/annual-clients-report';

  vm.reportDetails = {
    currencyId : Session.enterprise.currency_id,
    hideLockedClients : 0,
  };

  checkCachedConfiguration();

  // update the fiscal year on selection
  vm.onSelectFiscal = fiscal => {
    vm.reportDetails.fiscalId = fiscal.id;
  };

  vm.onSelectCronReport = report => {
    vm.reportDetails = angular.copy(report);
  };

  vm.onSelectCurrency = currencyId => {
    vm.reportDetails.currencyId = currencyId;
  };

  vm.onHideLockedClientsToggle = hideLockedClients => {
    vm.reportDetails.hideLockedClients = hideLockedClients;
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
      angular.merge(vm.reportDetails, cache.reportDetails);
    }
  }
}
