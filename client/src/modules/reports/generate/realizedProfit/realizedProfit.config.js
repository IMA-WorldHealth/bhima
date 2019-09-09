angular.module('bhima.controllers')
  .controller('realizedProfitController', RealizedProfitController);

RealizedProfitController.$inject = [
  '$sce', 'NotifyService', 'BaseReportService',
  'AppCache', 'reportData', '$state',
];

function RealizedProfitController($sce, Notify, SavedReports, AppCache, reportData, $state) {
  const vm = this;
  const cache = new AppCache('realizedProfit');
  const reportUrl = 'reports/finance/realizedProfit';

  vm.previewGenerated = false;
  vm.reportDetails = {};

  vm.clearPreview = function clearPreview() {
    vm.previewGenerated = false;
    vm.previewResult = null;
  };

  vm.onSelectFiscal = value => {
    vm.reportDetails.fiscalId = value.id;
  };

  vm.onSelectPeriodFrom = value => {
    vm.reportDetails.dateFrom = value;
  };

  vm.onSelectPeriodTo = value => {
    vm.reportDetails.dateTo = value;
  };

  vm.onChangeShowDetails = value => {
    vm.reportDetails.shouldShowDetails = value;
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
