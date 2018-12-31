angular.module('bhima.controllers')
  .controller('CashInvoiceModalController', CashInvoiceModalController);

CashInvoiceModalController.$inject = [
  'DebtorService', 'SessionService', '$timeout', 'NotifyService', '$state',
  '$rootScope', '$uibModalInstance',
];

/**
 * @module cash/modals/CashInvoiceModalController
 *
 * @description
 * This controller is responsible for retrieving a list of debtor invoices from the server,
 * and allowing selection of any number of invoices.
 */
function CashInvoiceModalController(Debtors, Session, $timeout, Notify, $state, $rootScope, Instance) {
  const vm = this;

  const debtorUuid = $state.params.debtor_uuid;
  const { invoices } = $state.params;

  // defaults to value
  vm.hasMissingDebtorUuid = !angular.isDefined(debtorUuid);

  // bind methods
  vm.submit = submit;
  vm.cancel = Instance.dismiss;

  vm.gridOptions = {
    appScopeProvider  : vm,
    multiSelect       : true,
    fastWatch         : true,
    flatEntityAccess  : true,
    onRegisterApi,
    enableColumnMenus : false,
    columnDefs        : [
      { name : 'reference' },
      { name : 'balance', cellFilter : `currency:${Session.enterprise.currencyId}` },
      { name : 'date', cellFilter : 'date' },
    ],
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

    const { rows } = vm.gridApi.grid;

    // loop through each invoice id passed in and reselect those that have
    // previously been selected
    rows.forEach((row) => {
      if (invoices.indexOf(row.entity.uuid) > -1) {
        vm.gridApi.selection.selectRow(row.entity);
      }
    });
  }

  function hasPositiveBalance(invoice) {
    return invoice.balance > 0;
  }

  // starts up the modal
  function startup() {
    // start up the loading indicator
    toggleLoadingState();

    // load debtor invoices
    Debtors.invoices(debtorUuid, { balanced : 0 })
      .then(data => {
        vm.gridOptions.data = data.filter(hasPositiveBalance);

        // requires timeout to bind angular ids to each row before selecting them.
        $timeout(() => {
          selectPreviouslySelectedInvoices();
        }, 0, false);
      })
      .catch((error) => {
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
    // we start in a neutral state
    vm.loading = false;
    vm.hasError = false;

    // retrieve the outstanding patient invoices from the ui grid
    const rows = vm.getSelectedRows();
    $rootScope.$broadcast('cash:configure', { invoices : rows });

    return Instance.close();
  }

  // start up the module
  startup();
}
