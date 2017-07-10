angular.module('bhima.controllers')
  .controller('cash_reportController', CashReportConfigController);

CashReportConfigController.$inject = [
  '$sce', 'NotifyService', 'BaseReportService', 'AppCache', 'reportData', '$state', 'CashboxService',
];

function CashReportConfigController($sce, Notify, SavedReports, AppCache, reportData, $state, Cashbox) {
  var vm = this;
  var cache = new AppCache('configure_cash_report');
  var reportUrl = 'reports/finance/cash_report';

  vm.previewGenerated = false;
  vm.reportDetails = {};
  vm.reportTypes = [
    { id: 1, label: 'FORM.LABELS.ENTRY_EXIT' },
    { id: 2, label: 'FORM.LABELS.ENTRY' },
    { id: 3, label: 'FORM.LABELS.EXIT' },
  ];

  checkCachedConfiguration();

  Cashbox.read(null, { detailed: 1 })
    .then(function (cashboxes) {
      cashboxes.forEach(function (cashbox) {
        cashbox.hrlabel = cashbox.label + ' ' + cashbox.symbol;
      });

      vm.cashboxes = cashboxes;
    })
    .catch(Notify.handleError);

  vm.clearPreview = function clearPreview() {
    vm.previewGenerated = false;
    vm.previewResult = null;
  };

  vm.preview = function preview(form) {
    if (form.$invalid) { return; }

    vm.reportDetails.account_id = vm.reportDetails.cashbox.account_id;
    delete vm.reportDetails.cashbox;
    
    // update cached configuration
    cache.reportDetails = angular.copy(vm.reportDetails);

    return SavedReports.requestPreview(reportUrl, reportData.id, angular.copy(vm.reportDetails))
      .then(function (result) {
        vm.previewGenerated = true;
        vm.previewResult = $sce.trustAsHtml(result);
      })
      .catch(Notify.handleError);
  };

  vm.requestSaveAs = function requestSaveAs() {
    var options = {
      url : reportUrl,
      report : reportData,
      reportOptions : angular.copy(vm.reportDetails),
    };

    return SavedReports.saveAsModal(options)
      .then(function () {
        $state.go('reportsBase.reportsArchive', { key : options.report.report_key });
      })
      .catch(Notify.handleError);
  };

  function checkCachedConfiguration() {
    if (cache.reportDetails) {
      vm.reportDetails = angular.copy(cache.reportDetails);
    }
  }
}