angular.module('bhima.controllers')
.controller('accounts_chartController', AccountChartController);

AccountChartController.$inject = [
  '$state', '$uibModalInstance', 'NotifyService', 'LanguageService', 'BaseReportService', 'reportDetails'
];

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
        ModalInstance.dismiss();
        Notify.success('FORM.INFO.CREATE_SUCCESS');
        $state.reload();
       })
      .catch(function (error) {
        var INTERNAL_SERVER_ERROR = 500;

        if (error.status === INTERNAL_SERVER_ERROR) {
          ModalInstance.dismiss();
        }

        Notify.handleError(error);

        throw error;
      })
      .finally(function () {
        vm.$loading = false;
      });
  }
}


