angular.module('bhima.controllers')
  .controller('TransactionTypeController', TransactionTypeController);

TransactionTypeController.$inject = [
  'TransactionTypeService', 'NotifyService',
  'ModalService', 'uiGridConstants',
];

/**
 * @function TransactionTypeController
 *
 * @description
 * This controller powers the transaction type grid.
 */
function TransactionTypeController(TransactionType, Notify, Modal, uiGridConstants) {
  const vm = this;

  // global variables
  vm.gridOptions = {};
  vm.gridApi = {};

  // grid default options
  vm.gridOptions.appScopeProvider = vm;
  vm.gridOptions.columnDefs = [{
    field : 'text',
    displayName : 'FORM.LABELS.TEXT',
    headerCellFilter : 'translate',
    cellFilter : 'translate',
    enableColumnMenu : false,
    sort : {
      direction : uiGridConstants.ASC,
      priority : 1,
    },
  }, {
    field : 'type',
    displayName : 'FORM.LABELS.TYPE',
    headerCellFilter : 'translate',
    cellFilter : 'translate',
    enableColumnMenu : false,
  }, {
    field : 'fixed',
    displayName : '',
    maxWidth : '150',
    cellTemplate : '/modules/transaction-type/templates/fixedStatus.cell.html',
    enableFiltering : false,
    enableColumnMenu : false,
    sort : {
      direction : uiGridConstants.DESC,
      priority : 0,
    },
  }];

  // register API
  vm.gridOptions.onRegisterApi = onRegisterApi;

  // expose to the view
  vm.addType = addType;
  vm.editType = editType;

  function onRegisterApi(gridApi) {
    vm.gridApi = gridApi;
  }

  // add new transaction type
  function addType() {
    const request = { action : 'create' };

    return Modal.openTransactionTypeActions(request)
      .then(res => {
        if (!res) { return; }
        Notify.success('FORM.INFO.SAVE_SUCCESS');
        loadTransactionTypes();
      })
      .catch(Notify.handleError);
  }

  // edit en existing transaction type
  function editType(transactionType) {
    if (transactionType.fixed) { return 0; }

    const request = { action : 'edit', identifier : transactionType.id };

    return Modal.openTransactionTypeActions(request)
      .then(res => {
        if (!res) { return; }
        Notify.success('FORM.INFO.UPDATE_SUCCESS');
        loadTransactionTypes();
      })
      .catch(Notify.handleError);
  }

  function loadTransactionTypes() {
    TransactionType.read()
      .then(list => {
        vm.gridOptions.data = list;
      })
      .catch(Notify.handleError);
  }

  function startup() {
    loadTransactionTypes();
  }

  // startup the module
  startup();
}
