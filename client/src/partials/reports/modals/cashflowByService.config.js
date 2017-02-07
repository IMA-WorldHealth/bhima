angular.module('bhima.controllers')
  .controller('cashflowByServiceController', CashflowByServiceConfigController);

CashflowByServiceConfigController.$inject = [
  '$state', '$http', '$uibModalInstance', 'NotifyService', 'LanguageService', 'reportDetails'
];

/**
 * CashflowByService
 *
 * @description
 * This controller is responsible for setting up the Cashflow by Service report
 * in the standard report controller.
 */
function CashflowByServiceConfigController($state, $http, ModalInstance, Notify, Languages, reportDetails) {
  var vm = this;

  // expose to the view
  vm.generate = requestPDF;
  vm.cancel = ModalInstance.dismiss;
  vm.report = reportDetails;

  vm.date = new Date();

  function requestPDF(form) {
    if (form.$invalid) { return; }

    var url = 'reports/finance/cashflow/services';

    var pdfParams = {
      reportId    : vm.report.id,
      label       : vm.label,
      dateFrom    : vm.dateFrom,
      dateTo      : vm.dateTo,
      lang        : Languages.key,
      renderer    : 'pdf',
      saveReport  : true
    };

    return $http.get(url, { params : pdfParams })
      .then(function (result) {
        ModalInstance.dismiss();
        $state.reload();
      })
      .catch(Notify.handleError);
  }
}
