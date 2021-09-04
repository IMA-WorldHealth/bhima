angular.module('bhima.controllers')
  .controller('fee_center_step_downController', FeeCenterStepdownReportConfigController);

FeeCenterStepdownReportConfigController.$inject = [
  '$sce', 'NotifyService', 'BaseReportService', 'AppCache', 'reportData', '$state',
];

/**
 * @function FeeCenterStepdownReportConfigController
 *
 * @description
 * This function renders the fee_center_step_down report.
 */
function FeeCenterStepdownReportConfigController($sce, Notify, SavedReports, AppCache, reportData, $state) {
  const vm = this;
  const cache = new AppCache('FeeCenterStepdownReport');
  const reportUrl = 'reports/finance/fee_center_step_down';

  vm.previewGenerated = false;
  vm.reportDetails = {};

  vm.onSelectFiscalYear = (fiscalYear) => {
    vm.reportDetails.fiscal_id = fiscalYear.id;
  };

  vm.onSelectPeriodFrom = function onSelectPeriodFrom(period) {
    vm.reportDetails.periodFrom = period.id;
  };

  vm.onSelectCurrency = (currency) => {
    vm.reportDetails.currency_id = currency.id;
  };

  vm.onSelectPeriodTo = function onSelectPeriodTo(period) {
    vm.reportDetails.periodTo = period.id;
  };

  vm.clearPreview = function clearPreview() {
    vm.previewGenerated = false;
    vm.previewResult = null;
  };

  vm.onSelectCronReport = report => {
    vm.reportDetails = angular.copy(report);
  };

  vm.preview = function preview(form) {
    if (form.$invalid) {
      Notify.danger('FORM.ERRORS.RECORD_ERROR');
      return 0;
    }

    // update cached configuration
    cache.reportDetails = angular.copy(vm.reportDetails);

    return SavedReports.requestPreview(reportUrl, reportData.id, angular.copy(vm.reportDetails))
      .then(result => {
        vm.previewGenerated = true;
        vm.previewResult = $sce.trustAsHtml(result);
      })
      .catch(Notify.handleError);
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

  checkCachedConfiguration();

  function checkCachedConfiguration() {
    if (cache.reportDetails) {
      vm.reportDetails = angular.copy(cache.reportDetails);
    }
  }
}