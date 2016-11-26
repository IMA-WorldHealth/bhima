angular.module('bhima.controllers')
  .controller('report_accountsController', ReportAccountsConfigController);

ReportAccountsConfigController.$inject = [
  '$state', '$uibModalInstance', 'AccountService', 'NotifyService', 'LanguageService', 'BaseReportService', 'reportDetails'
];

/**
 * ReportAccounts Config Controller
 *
 * @description
 * This controller is responsible for the configuration of the ReportAccounts report modal. All report
 * settings are sent to the server to generate a report document.
 */
function ReportAccountsConfigController($state, ModalInstance, Accounts, Notify, Languages, SavedReports, reportDetails) {
  var vm = this;
  var report = reportDetails;

  // expose to the view
  vm.generate = generate;
  vm.cancel = ModalInstance.dismiss;
  vm.report = report;

  //Default value for General Ledger
  vm.source = 1;

  vm.reportSource = [
    {id: 1, label : 'FORM.LABELS.GENERAL_LEDGER'},
    {id: 2, label : 'FORM.LABELS.POSTING_JOURNAL'},   
    {id: 3, label : 'FORM.LABELS.ALL'}
  ];


  Accounts.read(null, { detailed: 1, is_auxiliary: 0})
    .then(function (accounts) {
      accounts.forEach(function (account) {
        account.hrlabel = account.number + ' ' + account.label;
      });

      vm.accounts = accounts;
    })
    .catch(Notify.handleError);

  function generate(form) {
    var url = 'reports/finance/account';
    if (form.$invalid) { return; }

    var options = {
      account_id      : vm.account.id,
      account_label   : vm.account.label,
      account_number  : vm.account.number,
      sourceId        : vm.source.id,
      sourceLabel     : vm.source.label,
      label           : vm.label,
      lang            : Languages.key,
      reportType      : vm.type
    };

    return SavedReports.requestPDF(url, report, options)
      .then(function (result) {
        vm.$loading = false;
        ModalInstance.dismiss();
        $state.reload();
      });
  }
}
