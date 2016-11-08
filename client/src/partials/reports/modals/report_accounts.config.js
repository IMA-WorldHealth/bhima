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

  Accounts.read(null, { detailed: 1, is_auxiliary: 0})
    .then(function (accounts) {
      accounts.forEach(function (account) {
        account.hrlabel = account.number + ' ' + account.label;
      });

      vm.accounts = accounts;
    })
    .catch(Notify.errorHandler);

  function generate(form) {
    var url = 'reports/finance/report_accounts';
    if (form.$invalid) { return; }

    var options = {
      account_id: vm.account.id,
      account_label: vm.account.label,
      account_number: vm.account.number,
      label : vm.label,
      lang: Languages.key,
      reportType: vm.type
    };

    return SavedReports.requestPDF(url, report, options)
      .then(function (result) {
        vm.$loading = false;
        ModalInstance.dismiss();
        $state.reload();
      });
  }
}
