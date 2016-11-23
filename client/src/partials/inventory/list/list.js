angular.module('bhima.controllers')
.controller('InventoryListController', InventoryListController);

// dependencies injection
InventoryListController.$inject = [
  '$translate', 'InventoryService', 'NotifyService',
  'uiGridConstants', 'ModalService'
];

/**
 * Inventory List Controllers
 * This controller is responsible of the inventory list module
 */
function InventoryListController ($translate, Inventory, Notify, uiGridConstants, Modal) {
  var vm = this;

  /** gobal variables */
  vm.filterEnabled = false;
  vm.gridOptions = {};
  vm.gridApi = {};

  /** paths in the headercrumb */
  vm.bcPaths = [
    { label : 'TREE.INVENTORY' },
    { label : 'TREE.INVENTORY_LIST' }
  ];

  /** buttons in the headercrumb */
  vm.bcButtons = [
    { icon: 'fa fa-filter', label: $translate.instant('FORM.BUTTONS.FILTER'),
      action: toggleFilter, color: 'btn-default'
    },
    { icon: 'fa fa-plus', label: $translate.instant('FORM.LABELS.ADD'),
      action: addInventoryItem, color: 'btn-default',
      dataMethod: 'create'
    }
  ];

  /** button Print */
  vm.buttonPrint = { pdfUrl: '/reports/inventory/items' };

  // grid default options
  vm.gridOptions.appScopeProvider = vm;
  vm.gridOptions.enableFiltering  = vm.filterEnabled;
  vm.gridOptions.columnDefs       =
    [
      { field : 'code', displayName : 'FORM.LABELS.CODE', headerCellFilter : 'translate'
      },
      { field : 'consumable', displayName : 'FORM.LABELS.CONSUMABLE', headerCellFilter : 'translate',
        cellTemplate : '/partials/inventory/list/templates/consumable.cell.tmpl.html'
      },
      { field : 'groupName', displayName : 'FORM.LABELS.GROUP', headerCellFilter : 'translate'},
      { field : 'label', displayName : 'FORM.LABELS.LABEL', headerCellFilter : 'translate'},
      { field : 'price', displayName : 'FORM.LABELS.PRICE', headerCellFilter : 'translate', cellClass: 'text-right' },
      { field : 'type', displayName : 'FORM.LABELS.TYPE', headerCellFilter : 'translate'},
      { field : 'unit', displayName : 'FORM.LABELS.UNIT', headerCellFilter : 'translate'},
      { field : 'unit_weight', displayName : 'FORM.LABELS.WEIGHT', headerCellFilter : 'translate'},
      { field : 'unit_volume', displayName : 'FORM.LABELS.VOLUME', headerCellFilter : 'translate'},
      { field : 'action', displayName : '',
        cellTemplate: '/partials/inventory/list/templates/inventoryEdit.actions.tmpl.html',
        enableFiltering: false,
        enableColumnMenu: false
      }
    ];

  // register API
  vm.gridOptions.onRegisterApi = onRegisterApi;

  // API register function
  function onRegisterApi(gridApi) {
    vm.gridApi = gridApi;
  }

  /** expose to the view */
  vm.addInventoryItem  = addInventoryItem;
  vm.editInventoryItem = editInventoryItem;
  vm.toggleFilter      = toggleFilter;

  /** initial setting start */
  startup();

  /** add inventory item */
  function addInventoryItem() {
    var request = { action : 'add' };

    return Modal.openInventoryListActions(request)
    .then(function (res) {
      startup();
      Notify.success($translate.instant('FORM.INFO.SAVE_SUCCESS'));
    })
    .catch(Notify.errorHandler);
  }

  /** update inventory item */
  function editInventoryItem(inventory) {
    var request = { action : 'edit', identifier : inventory.uuid };

    return Modal.openInventoryListActions(request)
    .then(function (res) {
      startup();
      Notify.success($translate.instant('FORM.INFO.UPDATE_SUCCESS'));
    })
    .catch(Notify.errorHandler);
  }

  /** enable filter */
  function toggleFilter() {
    vm.filterEnabled = !vm.filterEnabled;
    vm.bcButtons[0].color = vm.filterEnabled ? 'btn-default active' : 'btn-default';
    vm.gridOptions.enableFiltering = vm.filterEnabled;
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.ALL);
  }

  /** startup */
  function startup() {
    Inventory.read()
    .then(function (list) {
      vm.gridOptions.data = list;
    })
    .catch(Notify.handleError);
  }
}
