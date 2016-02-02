angular.module('bhima.controllers')
.controller('CashInvoiceModalController', CashInvoiceModalController);

CashInvoiceModalController.$inject = [
  'Debtors', 'debtorId', 'invoices', '$uibModalInstance', 'SessionService'
];

/**
 * @module cash/modals/CashInvoiceModalController
 *
 * @description This controller is responsible for retrieving a list of debtor invoices
 * from the server, and allowing selection of any number of invoices.
 */
function CashInvoiceModalController(Debtors, debtorId, ModalInstance, Session) {
  var vm = this;

  // we start in a neutral state
  vm.loadingState = false;
  vm.loadingError = false;
  vm.noData = false;

  // defaults to value
  vm.missingId = !debtorId ;

  // bind methods
  vm.cancel = ModalInstance.dismiss;
  vm.submit = submit;

  // ui-grid options
  vm.gridOptions = {
    appScopeProvider : vm,
    enableSorting : false,
    multiSelect : true,
    showGridFooter : true,
    onRegisterApi : bindGridApi,
    columnDefs : [
      { name : 'reference', enableHiding : false },
      { name : 'balance', cellFilter: 'currency:' + Session.enterprise.currencyId, enableHiding : false, },
      { name : 'date', cellFilter: 'date', enableHiding: false }
    ],
    minRowsToShow : 10
  };

  // in order to use controllerAs syntax, we need to import the entire grid API
  // into the controller scope to bind the getSelectedRows method.
  function bindGridApi(api) {
    vm.getSelectedRows = api.selection.getSelectedRows;
  }

  // starts up the modal
  function startup() {

    // start up the loading indicator
    vm.loadingState = true;

    // load debtor invoices
    Debtors.invoices(debtorId).then(function (invoices) {
      vm.gridOptions.data = invoices;

      // warn the user that there is no data
      vm.noData = (vm.gridOptions.data.length === 0);
    })
    .catch(handler)
    .finally(function () { toggleLoadingState(); });
  }

  /** generic error handler */
  function handler(error) {
    vm.loadingError = error;
  }

  /** toggles loading state (boolean) */
  function toggleLoadingState() {
    vm.loadingState = !vm.loadingState;
  }

  // resolve the modal with the selected invoices to add to the cash payment bills
  function submit() {

    // retrieve the outstanding patient invoices from the ui grid
    var invoices = vm.getSelectedRows();

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
