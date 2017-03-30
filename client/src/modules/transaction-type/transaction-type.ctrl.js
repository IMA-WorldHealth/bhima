angular.module('bhima.controllers')
  .controller('TransactionTypeController', TransactionTypeController);

TransactionTypeController.$inject = [
  'TransactionTypeService', 'TransactionTypeStoreService', 'NotifyService',
  'ModalService',
];

/** Transaction Type Controller  */
function TransactionTypeController(TransactionType, TransactionTypeStore, Notify, Modal) {
  var vm = this;

  // global variables
  vm.gridOptions = {};
  vm.gridApi = {};

  // edit button template
  // @TODO - move this into it's own HTML template.
  var editTemplate =
    '<div class="ui-grid-cell-contents">' +
    '<a href title="{{ \'FORM.LABELS.EDIT\' | translate }}" ' +
    'ng-click="grid.appScope.editType(row.entity)" ' +
    'uib-popover="{{grid.appScope.notAllowed(row.entity.fixed) | translate }}" ' +
    'popover-placement="left"' +
    'popover-trigger="\'mouseenter\'"' +
    'popover-append-to-body="true"' +
    'data-edit-type="{{ row.entity.text }}">' +
    '<i class="fa" ng-class="{\'fa-info-circle\': row.entity.fixed === 1, \'fa-edit\': row.entity.fixed !== 1}"></i> ' +
    '</a></div>';

  // grid default options
  vm.gridOptions.appScopeProvider = vm;
  vm.gridOptions.columnDefs = [
    { field : 'text', displayName : 'FORM.LABELS.TEXT',
      headerCellFilter: 'translate', cellFilter: 'translate'},

    { field : 'description', displayName : 'FORM.LABELS.DESCRIPTION',
      headerCellFilter: 'translate'},

    { field : 'type', displayName : 'FORM.LABELS.TYPE',
      headerCellFilter: 'translate',
      cellTemplate: 'modules/templates/grid/transactionType.tmpl.html'},

    { field : 'prefix', displayName : 'FORM.LABELS.PREFIX',
      headerCellFilter: 'translate' },

    { field : 'action', displayName : '...',
      width: 25,
      cellTemplate: editTemplate,
      enableFiltering: false,
      enableColumnMenu: false
    }];

  // register API
  vm.gridOptions.onRegisterApi = onRegisterApi;

  // expose to the view
  vm.addType = addType;
  vm.editType = editType;

  // message for fixed transaction type
  vm.notAllowed = function (fixed) {
    if (!fixed) { return ; }
    return 'TRANSACTION_TYPE.FIXED_INFO';
  };

  function onRegisterApi(gridApi) {
    vm.gridApi = gridApi;
  }

  // add new transaction type
  function addType() {
    var request = { action : 'create' };

    return Modal.openTransactionTypeActions(request)
      .then(function (res) {
        if (!res) { return; }
        startup();
        Notify.success('FORM.INFO.SAVE_SUCCESS');
      })
      .catch(Notify.handleError);
  }

  // edit en existing transaction type
  function editType(transactionType) {
    if (transactionType.fixed) { return; }

    var request = { action: 'edit', identifier: transactionType.id };

    return Modal.openTransactionTypeActions(request)
      .then(function (res) {
        if (!res) { return; }
        startup();
        Notify.success('FORM.INFO.UPDATE_SUCCESS');
      })
      .catch(Notify.handleError);
  }

  function startup() {
    TransactionType.read()
      .then(function (list) {
        vm.gridOptions.data = list;
        TransactionTypeStore.refresh();
      })
      .catch(Notify.handleError);
  }

  // startup the module
  startup();

}
