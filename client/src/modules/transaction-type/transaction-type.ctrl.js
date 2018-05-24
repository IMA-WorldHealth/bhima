angular.module('bhima.controllers')
  .controller('TransactionTypeController', TransactionTypeController);

TransactionTypeController.$inject = [
  'TransactionTypeService', 'TransactionTypeStoreService', 'NotifyService',
  'ModalService', '$translate',
];

/**
 * @function TransactionTypeController
 *
 * @description
 * This controller powers the transaction type grid.
 */
function TransactionTypeController(TransactionType, TransactionTypeStore, Notify, Modal, $translate) {
  const vm = this;

  // global variables
  vm.gridOptions = {};
  vm.gridApi = {};

  // edit button template
  const editTemplate = `
    <div class="ui-grid-cell-contents text-right">
      <a
        href
        ng-click="grid.appScope.editType(row.entity)"
        uib-popover="{{row.entity._popover}}"
        popover-placement="left"
        popover-trigger="'mouseenter'"
        popover-append-to-body="true"
        data-edit-type="{{ row.entity.text }}">
        <span ng-show="row.entity.fixed">
          <i class="fa fa-lock"></i> <span translate>FORM.LABELS.LOCKED</span>
        </span>
        <span ng-hide="row.entity.fixed">
          <i class="fa fa-edit"></i> <span translate>FORM.LABELS.EDIT</span>
        </span>
      </a>
    </div>
    `;

  // grid default options
  vm.gridOptions.appScopeProvider = vm;
  vm.gridOptions.columnDefs = [{
    field : 'text',
    displayName : 'FORM.LABELS.TEXT',
    headerCellFilter : 'translate',
    cellFilter : 'translate',
    enableColumnMenu : false,
  }, {
    field : 'type',
    displayName : 'FORM.LABELS.TYPE',
    headerCellFilter : 'translate',
    cellFilter : 'translate',
    enableColumnMenu : false,
  }, {
    field : 'action',
    displayName : '...',
    cellTemplate : editTemplate,
    enableFiltering : false,
    enableColumnMenu : false,
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
        load();
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
        load();
      })
      .catch(Notify.handleError);
  }

  function load() {
    TransactionType.read()
      .then(list => {
        vm.gridOptions.data = list;

        list.forEach(type => {
          type._popover = type.fixed ? $translate.instant('TRANSACTION_TYPE.FIXED_INFO') : '';
        });
      })
      .catch(Notify.handleError);
  }

  function startup() {
    load();
  }

  // startup the module
  startup();
}
