angular.module('bhima.controllers')
  .controller('openDebtorsController', OpenDebtorsConfigController);

OpenDebtorsConfigController.$inject = [
  '$state', '$uibModalInstance', 'LanguageService', 'BaseReportService', 'reportDetails'
];

/**
 * @module
 * Open Debtors Controller
 *
 * @description
 * This controller produces the Open Debtors report of debtors which have unpaid
 * debts to the hospital. It provides the accountant a few different ways to
 * investigate their institution.
 */
function OpenDebtorsConfigController($state, ModalInstance, Languages, SavedReports, reportDetails) {
  var vm = this;
  var report = reportDetails;

  // expose to the view
  vm.generate = generate;
  vm.cancel = ModalInstance.dismiss;
  vm.report = report;

  // how the report should be ordered
  vm.orders = [
    { id: 'payment-date-asc', key: 'ORDER.PAYMENT_DATE_ASC' },
    { id: 'payment-date-desc', key: 'ORDER.PAYMENT_DATE_ASC' },
    { id: 'invoice-date-asc', key: 'ORDER.PAYMENT_DATE_ASC' },
    { id: 'invoice-date-desc', key: 'ORDER.PAYMENT_DATE_ASC' },
    { id: 'debt-desc', key: 'ORDER.PAYMENT_DATE_ASC' },
    { id: 'debt-asc', key: 'ORDER.PAYMENT_DATE_ASC' }
  ];

  // default order
  vm.order = 'payment-date-desc';

  // whether the report should include posting journal records or not
  vm.includePostingJournal = false;

  function generate(form) {
    if (form.$invalid) { return; }

    var url = 'reports/finance/debtors/open';

    var options = {
      label           : vm.label,
      lang            : Languages.key,
    };

    return SavedReports.requestPDF(url, report, options)
      .then(function (result) {
        ModalInstance.dismiss();
        $state.reload();
      });
  }
}
