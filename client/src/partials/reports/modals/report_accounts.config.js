angular.module('bhima.controllers')
  .controller('report_accountsController', ReportAccountsConfigController);

ReportAccountsConfigController.$inject = [
  '$state', '$uibModalInstance', 'NotifyService', 'LanguageService', 'BaseReportService', 'reportDetails', 'bhConstants'
];

/**
 * ReportAccounts Config Controller
 *
 * @description
 * This controller is responsible for the configuration of the ReportAccounts report modal. All report
 * settings are sent to the server to generate a report document.
 */
function ReportAccountsConfigController($state, ModalInstance, Notify, Languages, SavedReports, reportDetails, bhConstants) {
  var vm = this;
  var report = reportDetails;

  // expose to the view
  vm.generate = generate;
  vm.cancel = ModalInstance.dismiss;
  vm.report = report;
  vm.bhConstants = bhConstants;
  vm.onAccountSelect = onAccountSelect;

  // default value for General Ledger
  vm.source = 1;

  vm.reportSource = [
    {id: 1, label : 'FORM.LABELS.GENERAL_LEDGER'},
    {id: 2, label : 'FORM.LABELS.POSTING_JOURNAL'},
    {id: 3, label : 'FORM.LABELS.ALL'}
  ];

  function onAccountSelect(account) {
    vm.accountId = account.id;
    vm.accountLabel = account.label;
    vm.accountNumber = account.number;
  }

  function generate(form) {
    if (form.$invalid) { return; }

    var url = 'reports/finance/account';

    if(!vm.dateInterval){
      vm.dateTo = null;
      vm.dateFrom = null; 
    }

    var options = {
      account_id      : vm.accountId,
      account_label   : vm.accountLabel,
      account_number  : vm.accountNumber,
      sourceId        : vm.source.id,
      sourceLabel     : vm.source.label,
      label           : vm.label,
      lang            : Languages.key,
      dateTo          : vm.dateTo,
      dateFrom        : vm.dateFrom,
      reportType      : vm.type
    };

    return SavedReports.requestPDF(url, report, options)
      .then(function (result) {
        ModalInstance.dismiss();
        $state.reload();
      });
  }
}
