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
    { number : 1, name : 'ACCOUNT.EQUITY' },
    { number : 2, name : 'ACCOUNT.ASSET' },
    { number : 3, name : 'ACCOUNT.STOCKS' },
    { number : 4, name : 'ACCOUNT.THPART' },
    { number : 5, name : 'ACCOUNT.FINC' },
    { number : 6, name : 'ACCOUNT.COST' },
    { number : 7, name : 'ACCOUNT.REV' },
    { number : 8, name : 'ACCOUNT.EXP_PROD' },
    { number : '*', name : 'ACCOUNT.ALL_CLASSES' }
  ];

  // init date
  vm.dateOption = 'date-until';
  vm.date = new Date();

  // expose to the view
  vm.validate = validate;
  vm.generate = generate;
  vm.cancel = ModalInstance.dismiss;
  vm.report = report;

  // validate date range
  function validate() {
    var noMissingDatePart = (vm.dateFrom && vm.dateTo) || (!vm.dateFrom && !vm.dateTo);
    vm.validDateRange = noMissingDatePart ? true : false;
  }

  // generate the document
  function generate(form) {
    var url = 'reports/finance/balance';

    if (form.$invalid) { return; }

    var options = {
      accountOption: vm.accountOption,
      label: vm.label,
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
        ModalInstance.dismiss();
        $state.reload();
        Notify.success('FORM.INFO.CREATE_SUCCESS');
      });
  }
}
