angular.module('bhima.controllers')
  .controller('income_expenseController', IncomeExpenseConfigController);

IncomeExpenseConfigController.$inject = [
  '$state', '$uibModalInstance', 'CashboxService', 'NotifyService', 'LanguageService', 'BaseReportService', 'reportDetails'
];

/**
 * IncomeExpense Config Controller
 *
 * @description
 * This controller is responsible for the configuration of the income/expense report modal. All report
 * settings are sent to the server to generate a report document.
 */
function IncomeExpenseConfigController($state, ModalInstance, Cashbox, Notify, Languages, SavedReports, reportDetails) {
  var vm = this;
  var report = reportDetails;

  // expose to the view
  vm.generate = generate;
  vm.cancel = ModalInstance.dismiss;
  vm.report = report;

  vm.reportType = [
    {id: 1, label : 'FORM.LABELS.INCOME_EXPENSE'},
    {id: 2, label : 'FORM.LABELS.INCOME'},
    {id: 3, label : 'FORM.LABELS.EXPENSE'}
  ];

  Cashbox.read(null, { detailed: 1, is_auxiliary: 0})
    .then(function (cashboxes) {
      cashboxes.forEach(function (cashbox) {
        cashbox.hrlabel = cashbox.label + ' ' + cashbox.symbol;
      });

      vm.cashboxes = cashboxes;
    })
    .catch(Notify.errorHandler);

  function generate() {
    var url = 'reports/finance/income_expense';

    var options = {
      account_id: vm.cashbox.account_id,
      dateFrom: vm.dateFrom,
      label : vm.label,
      dateTo: vm.dateTo,
      lang: Languages.key,
      reportType: vm.type,
    };

    return SavedReports.requestPDF(url, report, options)
      .then(function (result) {
        vm.$loading = false;
        ModalInstance.dismiss();
        $state.reload();
      });
  }
}
