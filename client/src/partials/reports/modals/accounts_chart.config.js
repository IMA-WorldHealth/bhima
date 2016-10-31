angular.module('bhima.controllers')
.controller('accounts_chartController', AccountChartController);

AccountChartController.$inject = [ '$state', '$uibModalInstance', 'NotifyService', 'LanguageService', 'BaseReportService', 'reportDetails' ];

function AccountChartController($state, ModalInstance, Notify, Languages, SavedReports, reportDetails) {
  var vm = this;
  var report = reportDetails;

  // expose to the view
  vm.generate = generate;
  vm.cancel = ModalInstance.dismiss;
  vm.report = report;

  vm.$loading = false;

  function generate() {
    var url = 'reports/finance/accounts/chart';

    if (!vm.label) { return ; }
    vm.$loading = true;

    var options = {
      label : vm.label,
      lang: Languages.key
    };

    SavedReports.requestPDF(url, report, options)
      .then(function (result) {
        vm.$loading = false;
        ModalInstance.dismiss();
        $state.reload();
       })
      .catch(function (error) {
        vm.$loading = false;
        throw error;
      });
  }
}


