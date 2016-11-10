angular.module('bhima.controllers')
.controller('agedDebtorsController', AgedDebtorsConfigController);

// dependencies injection
AgedDebtorsConfigController.$inject = [ '$state', '$http', '$uibModalInstance', 'CashboxService', 'NotifyService', 'LanguageService', 'reportDetails' ];

/**
 * AgedDebtors config controller
 *
 * @description
 * This controller is responsible of Aged Debtors report, that report include
 * all incomes minus all depenses
 */
function AgedDebtorsConfigController($state, $http, ModalInstance, Cashbox, Notify, Languages, reportDetails) {
  var vm = this;

  // expose to the view
  vm.generate = requestPDF;
  vm.cancel = ModalInstance.dismiss;
  vm.report = reportDetails;

  vm.$loading = false;

  // TODO Move to service
  function requestPDF() {
    var url = 'reports/finance/agedDebtors';

    if (!vm.untilDate || !vm.label) { return ; }
    vm.$loading = true;

    // TODO Very specific parameters, API should be carefully designed
    var pdfParams = {
      reportId    : vm.report.id,
      label       : vm.label,
      lang        : Languages.key,
      untilDate   : vm.untilDate,
      renderer    : 'pdf',
      saveReport  : true
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
