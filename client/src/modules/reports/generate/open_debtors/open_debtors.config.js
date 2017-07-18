angular.module('bhima.controllers')
  .controller('open_debtorsController', OpenDebtorsConfigController);

OpenDebtorsConfigController.$inject = [
  '$sce', 'NotifyService', 'BaseReportService', 'AppCache', 'reportData', '$state', '$translate',
];

function OpenDebtorsConfigController($sce, Notify, SavedReports, AppCache, reportData, $state, $translate) {
  var vm = this;
  var cache = new AppCache('configure_open_debtors');
  var reportUrl = 'reports/finance/debtors/open';

  vm.previewGenerated = false;
  vm.reportDetails = {};

  checkCachedConfiguration();

  vm.clearPreview = function clearPreview() {
    vm.previewGenerated = false;
    vm.previewResult = null;
  };

  vm.columnOrder = [
    {
      label : $translate.instant('REPORT.ORDER.LAST_PAYMENT'),
      value : 'payment-date',
    },
    {
      label : $translate.instant('REPORT.ORDER.LAST_INVOICE'),
      value : 'invoice-date',
    },
    {
      label : $translate.instant('REPORT.ORDER.PATIENT_NAME'),
      value : 'patient-name',
    },
    {
      label : $translate.instant('REPORT.ORDER.TOTAL_DEBT'),
      value : 'debt',
    },    
  ];

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

  vm.preview = function preview(form) {
    if (form.$invalid) { return; }
    
    var orderBy = vm.reportDetails.orderBy? '-asc' : '-desc';
    vm.reportDetails.order += orderBy; 

    // update cached configuration
    cache.reportDetails = angular.copy(vm.reportDetails);

    return SavedReports.requestPreview(reportUrl, reportData.id, angular.copy(vm.reportDetails))
      .then(function (result) {
        vm.previewGenerated = true;
        vm.previewResult = $sce.trustAsHtml(result);
      })
      .catch(Notify.handleError);
  };

  vm.onSelectPeriod =  function onSelectPeriod(period){
    vm.reportDetails.date = period.end_date;
  };

  function checkCachedConfiguration() {
    if (cache.reportDetails) {
      vm.reportDetails = angular.copy(cache.reportDetails);
    }
  }
}