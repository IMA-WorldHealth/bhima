angular.module('bhima.controllers')
  .controller('balance_reportController', BalanceReportConfigController);

BalanceReportConfigController.$inject = [
  '$sce', 'NotifyService', 'BaseReportService', 'AppCache', 'reportData', '$state',
  'LanguageService', 'moment',
];

function BalanceReportConfigController($sce, Notify, SavedReports, AppCache, reportData, $state,
  Languages, moment) {
  var vm = this;
  var cache = new AppCache('configure_balance_report');
  var reportUrl = 'reports/finance/balance';

  vm.previewGenerated = false;
  vm.reportDetails = {};
  vm.timestamp = new Date();
  vm.date = angular.copy(vm.timestamp);

  vm.clearPreview = function clearPreview() {
    vm.previewGenerated = false;
    vm.previewResult = null;
  };

  vm.preview = function preview(form) {
    var options;

    if (form.$invalid) { return 0; }

    options = {
      accountOption : vm.accountOption,
      lang : Languages.key,
    };

    if (vm.dateOption === 'date-range') {
      options.dateFrom = moment(vm.dateFrom).format('YYYY-MM-DD');
      options.dateTo = moment(vm.dateTo).format('YYYY-MM-DD');
    } else {
      options.date = moment(vm.date).format('YYYY-MM-DD');
    }

    vm.reportDetails = options;

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

  checkCachedConfiguration();

  function checkCachedConfiguration() {
    if (cache.reportDetails) {
      vm.reportDetails = angular.copy(cache.reportDetails);
    }
  }
}
