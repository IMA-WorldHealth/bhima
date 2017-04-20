angular.module('bhima.controllers')
.controller('agedCreditorsController', AgedCreditorsConfigController);

AgedCreditorsConfigController.$inject = [
  '$state', '$http', '$uibModalInstance', 'NotifyService', 'LanguageService', 'reportDetails'
];

/**
 * AgedSuppliers config controller
 *
 * @description
 * This controller is responsible of Aged Suppliers report, that report include
 * all incomes minus all depenses
 */
function AgedCreditorsConfigController($state, $http, ModalInstance, Notify, Languages, reportDetails) {
  var vm = this;

  // expose to the view
  vm.generate = requestPDF;
  vm.cancel = ModalInstance.dismiss;
  vm.report = reportDetails;

  vm.date = new Date();

  function requestPDF(form) {
    if (form.$invalid) { return; }

    var url = 'reports/finance/creditors/aged';

    // TODO Very specific parameters, API should be carefully designed
    var pdfParams = {
      reportId    : vm.report.id,
      label       : vm.label,
      date        : vm.date,
      zeroes      : vm.zeroes,
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
