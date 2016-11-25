'use strict';

angular.module('bhima.controllers')
  .controller('clients_reportController', ClientsReportController);

ClientsReportController.$inject = [ '$state', '$uibModalInstance', 'DebtorGroupService', 'NotifyService', 'LanguageService', 'BaseReportService', 'reportDetails' ];

/**
 * Clients config controller
 *
 * @description
 * This controller is responsible for the configuration of the clients report. All report
 * settings are sent to the server to generate a report document.
 */

function ClientsReportController($state, ModalInstance, Clients, Notify, Languages, SavedReports, reportDetails) {
  var vm = this;
  var report = reportDetails;

  // expose to the view
  vm.generate = generate;
  vm.cancel = ModalInstance.dismiss;
  vm.report = report;
  vm.clients = [];
  vm.$loading = false;

  Clients.read(null)
    .then(function (list) {
      vm.clients = list;
    })
    .catch(Notify.errorHandler);

  function generate() {
    var url = 'reports/finance/clientsReport';
    if (!vm.dateFrom || !vm.label || !vm.dateTo) { return ; }

    vm.$loading = true;

    var options = {
      label : vm.label,
      dateFrom : new Date(vm.dateFrom),
      dateTo : new Date(vm.dateTo),
      lang : Languages.key,
      ignoredClients : vm.ignoredClients,
      detailPrevious : vm.detailPrevious
    };

    SavedReports.requestPDF(url, report, options)
      .then(function () {
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
