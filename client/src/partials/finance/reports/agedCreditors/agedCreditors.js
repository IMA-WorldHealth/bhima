angular.module('bhima.controllers')
  .controller('AgedCreditorsController', AgedCreditorsController);

AgedCreditorsController.$inject = [
  'NotifyService', 'AgedCreditorReportService'
];

/**
 * Aged Creditor Report Page
 *
 * This page allows users to configure the aged creditor report options
 */
function AgedCreditorsController(Notify, AgedCreditorReports) {
  var vm = this;

  // basic grid options
  vm.gridOptions = {
    fastWatch: true,
    flatEntityAccess: true,
    appScopeProvider: vm
  };

  // report column definitions
  vm.gridOptions.columnDefs = [
    { field: 'label', displayName: 'FORM.LABELS.LABEL', headerCellFilter: 'translate' },
    { field: 'timestamp', displayName: 'FORM.LABELS.DATE', headerCellFilter: 'translate', cellFilter: 'date' },
    { field: 'user', displayName: 'FORM.LABELS.USER', headerCellFilter: 'translate' },
    { field: 'actions', displayName: 'FORM.LABELS.ACTIONS', headerCellFilter: 'translate' }
  ];

  vm.gridOptions.data = [];

  // open the configuration modal for a new Aged Creditors report
  vm.create = function create() {
    AgedCreditorReports.openCreateModal();
  };
}
