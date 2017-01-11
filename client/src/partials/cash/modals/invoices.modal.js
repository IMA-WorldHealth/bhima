angular.module('bhima.controllers')
  .controller('CashInvoiceModalController', CashInvoiceModalController);

CashInvoiceModalController.$inject = [
  'DebtorService', 'debtorId', 'invoices', '$uibModalInstance', 'SessionService',
  '$timeout', 'NotifyService'
];

/**
 * @module cash/modals/CashInvoiceModalController
 *
 * @description
 * This controller is responsible for retrieving a list of debtor invoices
 * from the server, and allowing selection of any number of invoices.
 */
function CashInvoiceModalController(Debtors, debtorId, invoices, ModalInstance, Session, $timeout, Notify) {
  var vm = this;

  // we start in a neutral state
  vm.loading = false;
  vm.hasError = false;

  // defaults to value
  vm.missingId = !debtorId ;

  // bind methods
  vm.cancel = ModalInstance.dismiss;
  vm.submit = submit;

  vm.gridOptions = {
    appScopeProvider : vm,
    multiSelect: true,
    fastWatch: true,
    flatEntityAccess: true,
    onRegisterApi : onRegisterApi,
    enableColumnMenus: false,
    columnDefs : [
      { name : 'reference' },
      { name : 'balance', cellFilter: 'currency:' + Session.enterprise.currencyId},
      { name : 'date', cellFilter: 'date' }
    ],
    minRowsToShow : 10
  };

  function selectionChangeCallback() {
    vm.rows = vm.getSelectedRows();
  }

  // in order to use controllerAs syntax, we need to import the entire grid API
  // into the controller scope to bind the getSelectedRows method.
  function onRegisterApi(gridApi) {
    vm.getSelectedRows = gridApi.selection.getSelectedRows;

    // set up callbacks
    gridApi.selection.on.rowSelectionChanged(null, selectionChangeCallback);
    gridApi.selection.on.rowSelectionChangedBatch(null, selectionChangeCallback);

    // bind the grid API
    vm.gridApi = gridApi;

    selectPreviouslySelectedInvoices();
  }

  // toggles previously selected rows
  function selectPreviouslySelectedInvoices() {
    if (!vm.gridApi) { return; }

    var rows = vm.gridApi.grid.rows;

    // loop through each invoice id passed in and reselect those that have
    // previously been selected
    rows.forEach(function (row) {
      if (invoices.indexOf(row.entity.uuid) > -1) {
        vm.gridApi.selection.selectRow(row.entity);
      }
    });
  }

  // starts up the modal
  function startup() {

    // start up the loading indicator
    toggleLoadingState();

    // load debtor invoices
    Debtors.invoices(debtorId, { balanced : 0 })
      .then(function (invoices) {
        vm.gridOptions.data = invoices;

        // requires timeout to bind angular ids to each row before selecting them.
        $timeout(function () {
          selectPreviouslySelectedInvoices();
        }, 0, false);
      })
      .catch(function (error) {
        vm.hasError = true;
        Notify.handleError(error);
      })
      .finally(toggleLoadingState);
  }

  /* toggles loading state (boolean) */
  function toggleLoadingState() {
    vm.loading = !vm.loading;
  }

  // resolve the modal with the selected invoices to add to the cash payment bills
  function submit() {

    // retrieve the outstanding patient invoices from the ui grid
    var invoices = vm.getSelectedRows();

    ModalInstance.close(invoices);
  }

  // start up the module
  startup();
}
