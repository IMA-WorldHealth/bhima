angular.module('bhima.controllers')
.controller('accounts_chartController', AccountChartController);

AccountChartController.$inject = [ '$state', '$http', '$uibModalInstance', 'NotifyService', 'LanguageService' ];

function AccountChartController($state, $http, ModalInstance, Notify, Languages) {
  var vm = this;

  // expose to the view
  vm.generate = requestPDF;
  vm.cancel = ModalInstance.dismiss;

  // TODO This should be passed into the modal from the report controller
  vm.reportId = 2;
  vm.reportKey = 'accounts_chart';
  vm.reportTitleKey = 'REPORT.CHART_OF_ACCOUNTS';

  vm.$loading = false;

  // TODO Move to service
  function requestPDF() {
    var url = 'reports/finance/accounts/chart';

    if (!vm.label) { return ; }
    vm.$loading = true;

    // TODO Very specific parameters, API should be carefully designed
    var pdfParams = {
      reportId : vm.reportId,
      label : vm.label,
      lang: Languages.key,
      renderer : 'pdf',
      saveReport : true
    };

    $http.get(url, { params : pdfParams })
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


