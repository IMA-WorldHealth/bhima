'use strict';

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

  vm.$loading = false;

  Cashbox.read(null, { detailed: 1, is_auxiliary: 0})
  .then(function (list) {
    list.forEach(function (cashbox) {
      cashbox.hrlabel = cashbox.label + ' ' + cashbox.symbol;
    });
    vm.cashboxes = list;
  })
  .catch(Notify.errorHandler);

  function generate() {
    var url = 'reports/finance/cashflow';
    if (!vm.cashbox || !vm.dateFrom || !vm.label || !vm.dateTo) { return ; }

    vm.$loading = true;

    var options = {
      account_id: vm.cashbox.account_id,
      dateFrom: vm.dateFrom,
      label : vm.label,
      dateTo: vm.dateTo,
      lang: Languages.key,
      weekly : vm.weekly
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
