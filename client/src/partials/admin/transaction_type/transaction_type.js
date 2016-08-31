'use strict';

// controller definition
angular.module('bhima.controllers')
.controller('TransactionTypeController', TransactionTypeController);

// dependencies injection
TransactionTypeController.$inject = [
  'TransactionTypeService', 'NotifyService', 'ModalService',
  '$translate'
];

/** Transaction Type Controller  */
function TransactionTypeController(TransactionType, Notify, Modal, $translate) {
  var vm = this;

  // global variables
  vm.gridOptions = {};
  vm.gridApi = {};

  // edit button template
  var editTemplate = '<div class="ui-grid-cell-contents">' +
    '<a title="{{ \'FORM.LABELS.EDIT\' | translate }}" href="" ' +
    'ng-click="grid.appScope.editType(row.entity)" ' +
    'data-edit-type="{{ row.entity.text }}">' +
    '<i class="fa fa-edit"></i> ' +
    '</a></div>';

  // grid default options
  vm.gridOptions.appScopeProvider = vm;
  vm.gridOptions.columnDefs       =
    [
      { field : 'text', displayName : 'FORM.LABELS.TEXT',
        headerCellFilter: 'translate', cellFilter: 'translate'},

      { field : 'description', displayName : 'FORM.LABELS.DESCRIPTION',
        headerCellFilter: 'translate'},

      { field : 'type', displayName : 'FORM.LABELS.TYPE',
        headerCellFilter: 'translate',
        cellTemplate: 'partials/templates/grid/transactionType.tmpl.html'},

      { field : 'fixed', displayName : 'FORM.LABELS.STATUS',
        headerCellFilter: 'translate', width: 70,
        cellTemplate: 'partials/templates/grid/transactionType.fixed.tmpl.html'},

      { field : 'prefix', displayName : 'FORM.LABELS.PREFIX',
        headerCellFilter: 'translate'},

      { field : 'action', displayName : '...',
        width: 25,
        cellTemplate: editTemplate,
        enableFiltering: false,
        enableColumnMenu: false
      }
    ];

  // register API
  vm.gridOptions.onRegisterApi = onRegisterApi;

  // expose to the view
  vm.addType = addType;
  vm.editType = editType;

  /** API register function */
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
    .catch(Notify.errorHandler);
  }

  // edit en existing transaction type
  function editType(transactionType) {
    var request = { action : 'edit', identifier : transactionType.id };

    return Modal.openTransactionTypeActions(request)
    .then(function (res) {
      if (!res) { return; }
      startup();
      Notify.success('FORM.INFO.UPDATE_SUCCESS');
    })
    .catch(Notify.errorHandler);
  }

  function startup() {
    TransactionType.read()
    .then(function (list) {
      vm.gridOptions.data = list;
    })
    .catch(Notify.handleError);
  }

  // startup the module
  startup();

}
