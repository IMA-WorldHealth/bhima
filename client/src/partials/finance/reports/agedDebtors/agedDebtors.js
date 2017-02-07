angular.module('bhima.controllers')
  .controller('AgedDebtorsController', AgedDebtorsController);

AgedDebtorsController.$inject = [
  'NotifyService', 'AgedDebtorReportService'
];

/**
 * Aged Debtor Report Page
 *
 * This page allows users to configure the aged debtor report options
 */
function AgedDebtorsController(Notify, AgedDebtorReports) {
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

  // open the configuration modal for a new Aged Debtors report
  vm.create = function create() {
    AgedDebtorReports.openCreateModal();
  };
}
