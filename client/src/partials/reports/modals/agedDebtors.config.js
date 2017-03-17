angular.module('bhima.controllers')
.controller('agedDebtorsController', AgedDebtorsConfigController);

AgedDebtorsConfigController.$inject = [
  '$state', '$http', '$uibModalInstance', 'NotifyService', 'LanguageService', 'reportDetails', 'SessionService'
];

/**
 * AgedDebtors config controller
 *
 * @description
 * This controller is responsible of Aged Debtors report, that report include
 * all incomes minus all depenses
 */
function AgedDebtorsConfigController($state, $http, ModalInstance, Notify, Languages, reportDetails, Session) {
  var vm = this;

  // expose to the view
  vm.generate = requestPDF;
  vm.cancel = ModalInstance.dismiss;
  vm.report = reportDetails;
  vm.currency_id = Session.enterprise.currency_id;

  vm.date = new Date();

  function requestPDF(form) {
    if (form.$invalid) { return; }

    var url = 'reports/finance/debtors/aged';

    // TODO Very specific parameters, API should be carefully designed
    var pdfParams = {
      reportId    : vm.report.id,
      label       : vm.label,
      date        : vm.date,
      zeroes      : vm.zeroes,
      lang        : Languages.key,
      renderer    : 'pdf',
      saveReport  : true,
      currency_id : vm.currency_id
    };

    return $http.get(url, { params : pdfParams })
      .then(function (result) {
        ModalInstance.dismiss();
        $state.reload();
      })
      .catch(Notify.handleError);
  }
}
