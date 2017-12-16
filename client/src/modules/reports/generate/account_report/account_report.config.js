angular.module('bhima.controllers')
  .controller('account_reportController', AccountReportConfigController);

AccountReportConfigController.$inject = [
  '$sce', 'NotifyService', 'BaseReportService', 'AppCache', 'reportData',
  '$state', 'moment'
];

function AccountReportConfigController($sce, Notify, SavedReports, AppCache, reportData, $state, Moment) {
  var vm = this;
  var cache = new AppCache('configure_account_report');
  var reportUrl = 'reports/finance/account_report';

  vm.previewGenerated = false;
  vm.reportDetails = {};
  vm.dateInterval=1;

  checkCachedConfiguration();

  vm.selectAccount = function selectAccount(account) {
    vm.reportDetails.account_id = account.id;
  };

  vm.selectSource = function selectSource(source) {
    vm.reportDetails.source = source;
  };

  vm.clearPreview = function clearPreview() {
    vm.previewGenerated = false;
    vm.previewResult = null;
  };

  vm.requestSaveAs = function requestSaveAs() {
    parseDateInterval(vm.reportDetails);

    // @FIXME
    var options = {
      url : reportUrl,
      report : reportData,
      reportOptions : sanitiseDateStrings(vm.reportDetails),
    };

    return SavedReports.saveAsModal(options)
      .then(function () {
        $state.go('reportsBase.reportsArchive', { key : options.report.report_key });
      })
      .catch(Notify.handleError);
  };

  vm.preview = function preview(form) {
    if (form.$invalid) { return; }

    parseDateInterval(vm.reportDetails);


    // update cached configuration
    cache.reportDetails = angular.copy(vm.reportDetails);

    var sendDetails = sanitiseDateStrings(vm.reportDetails);
    sendDetails.dateTo = Moment(sendDetails.dateTo).format('YYYY-MM-DD');
    sendDetails.dateFrom = Moment(sendDetails.dateFrom).format('YYYY-MM-DD');

    return SavedReports.requestPreview(reportUrl, reportData.id, sendDetails)
      .then(function (result) {
        vm.previewGenerated = true;
        vm.previewResult = $sce.trustAsHtml(result);
      })
      .catch(Notify.handleError);
  };

  function sanitiseDateStrings(options) {
    var sanitisedOptions = angular.copy(options);
    sanitisedOptions.dateTo = Moment(sanitisedOptions.dateTo).format('YYYY-MM-DD');
    sanitisedOptions.dateFrom = Moment(sanitisedOptions.dateFrom).format('YYYY-MM-DD');
    return sanitisedOptions;
  }

  // @TODO validation on dates - this should be done through a 'period select' component
  function parseDateInterval(reportDetails) {
    if (!vm.dateInterval) {
      reportDetails.dateTo = reportDetails.dateFrom = null;
    }
  }

  function checkCachedConfiguration() {
    if (cache.reportDetails) {
      vm.reportDetails = angular.copy(cache.reportDetails);
    }
  }
}
