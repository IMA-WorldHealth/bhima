angular.module('bhima.controllers')
  .controller('CashInvoiceModalController', CashInvoiceModalController);

CashInvoiceModalController.$inject = [
  'DebtorService', 'debtorId', 'invoiceIds', '$uibModalInstance', 'SessionService',
  '$timeout', 'NotifyService'
];

/**
 * @module cash/modals/CashInvoiceModalController
 *
 * @description This controller is responsible for retrieving a list of debtor invoices
 * from the server, and allowing selection of any number of invoices.
 */
function CashInvoiceModalController(Debtors, debtorId, invoiceIds, ModalInstance, Session, $timeout, Notify) {
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
      { name : 'reference'},
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
  function onRegisterApi(api) {
    vm.getSelectedRows = api.selection.getSelectedRows;
    vm.selectRow = api.selection.selectRow;

    // set up callbacks
    api.selection.on.rowSelectionChanged(null, selectionChangeCallback);
    api.selection.on.rowSelectionChangedBatch(null, selectionChangeCallback);
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

          // loop through each invoice id passed in and reselect those that have
          // previously been selected
          vm.gridOptions.data.forEach(function (invoice) {
            if (invoiceIds.indexOf(invoice.invoice_uuid) > -1) {
              vm.selectRow(invoice);
            }
          });
        });
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

    // block the submission if there are no values selected
    vm.empty = (invoices.length === 0);
    if (vm.empty) { return; }

    // sum up the total cost of the selected rows
    var total = invoices.reduce(function (aggregate, invoice) {
      return aggregate + invoice.balance;
    }, 0);

    // return both values to CashController
    ModalInstance.close({ invoices : invoices, total : total });
  }

  // start up the module
  startup();
}
