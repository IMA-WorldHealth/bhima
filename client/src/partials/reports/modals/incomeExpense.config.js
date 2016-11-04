'use strict';

angular.module('bhima.controllers')
.controller('incomeExpenseController', IncomeExpenseConfigController);

// dependencies injection
IncomeExpenseConfigController.$inject = [ '$state', '$http', '$uibModalInstance', 'LanguageService', '$translate', 'CashboxService', 'NotifyService'];

/**
 * IncomeExpense config controller
 *
 * @description
 * This controller is responsible of Income Export report, that report include
 */
function IncomeExpenseConfigController($state, $http, ModalInstance, Languages, $translate, Cashbox, Notify) {
  var vm = this;

  // expose to the view
  vm.generate = requestPDF;
  vm.cancel = ModalInstance.dismiss;

  // TODO This should be passed into the modal from the report controller
  vm.reportId = 4;
  vm.reportKey = 'incomeExpense';
  vm.reportTitleKey = 'TREE.INCOME_EXPENSE';

  vm.reportTypes = [
    {id: 1, label : $translate.instant('FORM.LABELS.INCOME_EXPENSE')},
    {id: 2, label : $translate.instant('FORM.LABELS.INCOME')},
    {id: 3, label : $translate.instant('FORM.LABELS.EXPENSE')}
  ];  

  vm.$loading = false;

  /** init */
  Cashbox.read(null, { detailed: 1, is_auxiliary: 0})
  .then(function (list) {
    list.forEach(function (cashbox) {
      console.log('JJJJJJJJJJJJJJJJJJJJJ');
      console.log(cashbox);


      cashbox.hrlabel = cashbox.label + ' ' + cashbox.symbol;
    });
    vm.cashboxes = list;
  })
  .catch(Notify.errorHandler);

  // TODO Move to service
  function requestPDF() {
    var url = 'reports/finance/incomeExpense';

    if (!vm.label || !vm.dateFrom || !vm.dateTo || !vm.reportType || !vm.cashbox) { return ; }
    vm.$loading = true;


    // TODO Very specific parameters, API should be carefully designed
    var pdfParams = {
      reportId    : vm.reportId,
      label       : vm.label,
      dateFrom    : vm.dateFrom,
      dateTo      : vm.dateTo,
      reportType  : vm.reportType.id,
      account_id  : vm.cashbox.account_id,
      lang        : Languages.key,
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