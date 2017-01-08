angular.module('bhima.controllers')
.controller('cashflowController', CashflowConfigController);

CashflowConfigController.$inject = [ '$state', '$uibModalInstance', 'CashboxService', 'NotifyService', 'LanguageService', 'BaseReportService', 'reportDetails' ];

/**
 * Cashflow config controller
 *
 * @description
 * This controller is responsible for the configuration of the cashflow report. All report
 * settings are sent to the server to generate a report document.
 */
function CashflowConfigController($state, ModalInstance, Cashbox, Notify, Languages, SavedReports, reportDetails) {
  var vm = this;
  var report = reportDetails;

  // expose to the view
  vm.generate = generate;
  vm.cancel = ModalInstance.dismiss;
  vm.report = report;

  Cashbox.read(null, { detailed: 1 })
    .then(function (cashboxes) {

      cashboxes.forEach(function (cashbox) {
        cashbox.hrlabel = cashbox.label + ' ' + cashbox.symbol;
      });

      vm.cashboxes = cashboxes;
    })
    .catch(Notify.handleError);

  function generate(form) {
    if (form.$invalid) { return; }

    var url = 'reports/finance/cashflow';

    var options = {
      account_id: vm.cashbox.account_id,
      dateFrom: vm.dateFrom,
      label : vm.label,
      dateTo: vm.dateTo,
      lang: Languages.key,
      weekly : vm.weekly
    };

    return SavedReports.requestPDF(url, report, options)
      .then(function (result) {
        ModalInstance.dismiss();
        $state.reload();
      })
      .catch(Notify.handleError);
  }
}
