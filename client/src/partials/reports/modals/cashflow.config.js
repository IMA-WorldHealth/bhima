'use strict';

angular.module('bhima.controllers')
.controller('cashflowController', CashflowConfigController);

// dependencies injection
CashflowConfigController.$inject = [ '$state', '$http', '$uibModalInstance', 'CashboxService', 'NotifyService', 'LanguageService' ];

/**
 * Cashflow config controller
 *
 * @description
 * This controller is responsible of cash flow report, that report include
 * all incomes minus all depenses
 */
function CashflowConfigController($state, $http, ModalInstance, Cashbox, Notify, Languages) {
  var vm = this;

  // expose to the view
  vm.generate = requestPDF;
  vm.cancel = ModalInstance.dismiss;

  // TODO This should be passed into the modal from the report controller
  vm.reportId = 1;
  vm.reportKey = 'cashflow';
  vm.reportTitleKey = 'TREE.CASHFLOW';

  vm.$loading = false;

  /** init */
  Cashbox.read(null, { detailed: 1, is_auxiliary: 0})
  .then(function (list) {
    list.forEach(function (cashbox) {
      cashbox.hrlabel = cashbox.label + ' ' + cashbox.symbol;
    });
    vm.cashboxes = list;
  })
  .catch(Notify.errorHandler);

  // TODO Move to service
  function requestPDF() {
    var url = 'reports/finance/cashflow';

    if (!vm.cashbox || !vm.dateFrom || !vm.label || !vm.dateTo) { return ; }
    vm.$loading = true;

    // TODO Very specific parameters, API should be carefully designed
    var pdfParams = {
      reportId : vm.reportId,
      account_id: vm.cashbox.account_id,
      dateFrom: vm.dateFrom,
      label : vm.label,
      dateTo: vm.dateTo,
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

  /** generate cashflow report */
  function generate() {
    if (!vm.cashbox || !vm.dateFrom || !vm.dateTo) { return ; }
    var params = {
      dateFrom : vm.dateFrom,
      dateTo   : vm.dateTo,
      cashbox  : vm.cashbox
    };
    $state.go('cashflow.report', params);
  }
}
