angular.module('bhima.controllers')
  .controller('balanceController', BalanceReportConfigController);

BalanceReportConfigController.$inject = [
  '$state', '$uibModalInstance', 'NotifyService', 'LanguageService', 'BaseReportService', 'reportDetails'
];

/**
 * Balance Config Controller
 *
 * @description
 * This controller is responsible for the configuration of the balance report modal.
 */
function BalanceReportConfigController($state, ModalInstance, Notify, Languages, SavedReports, reportDetails) {
  var vm = this;
  var report = reportDetails;

  // global variables
  vm.classes = [
    { number : 1, name : 'ACCOUNT.ACCOUNT_EQUITY' },
    { number : 2, name : 'ACCOUNT.ACCOUNT_ASSET' },
    { number : 3, name : 'ACCOUNT.ACCOUNT_STOCKS' },
    { number : 4, name : 'ACCOUNT.ACCOUNT_THPART' },
    { number : 5, name : 'ACCOUNT.ACCOUNT_FINC' },
    { number : 6, name : 'ACCOUNT.ACCOUNT_COST' },
    { number : 7, name : 'ACCOUNT.ACCOUNT_REV' },
    { number : 8, name : 'ACCOUNT.ACCOUNT_EXP_PROD' },
    { number : '*', name : 'ACCOUNT.ALL_ACCOUNT' }
  ];

  // init date
  vm.date = new Date();

  // expose to the view
  vm.generate = generate;
  vm.cancel = ModalInstance.dismiss;
  vm.report = report;

  // generate the document
  function generate(form) {
    var url = 'reports/finance/balance';

    if (form.$invalid) { return; }

    vm.$loading = true;

    var options = {
      label : vm.label,
      classe: vm.classe.number,
      classe_name: vm.classe.name,
      lang: Languages.key
    };

    if (vm.dateOption === 'date-range') {
      options.dateFrom = vm.dateFrom;
      options.dateTo = vm.dateTo;
    } else {
      options.date = vm.date;
    }

    return SavedReports.requestPDF(url, report, options)
      .then(function (result) {
        vm.$loading = false;
        ModalInstance.dismiss();
        $state.reload();
      });
  }
}
