angular.module('bhima.controllers')
.controller('InventoryListController', InventoryListController);

// dependencies injection
InventoryListController.$inject = [
  '$translate', 'InventoryService', 'NotifyService', 'uiGridConstants', 'ModalService'
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
    { icon: 'fa fa-filter', label: $translate.instant('FORM.BUTTONS.FILTER'), action: toggleFilter, color: 'btn-default' },
    { icon: 'fa fa-plus', label: $translate.instant('FORM.LABELS.ADD'), action: addInventoryItem, color: 'btn-primary' },
    { icon: 'fa fa-print', label: $translate.instant('FORM.LABELS.PRINT'), action: printList, color: 'btn-default' }
  ];

  // edit button template
  var editTemplate = '<div class="text-center">' +
    '<button class="btn btn-sm btn-default" ng-click="grid.appScope.editInventoryItem(row.entity)">' +
    '<i class="fa fa-edit"></i> ' +
    '{{ "FORM.LABELS.EDIT" | translate }}' +
    '</button></div>';

  // consumable icon template
  var iconTemplate = '<div class="text-center">' +
    '<i ng-show="row.entity.consumable" class="text-success fa fa-check-circle-o fa-2x"></i>' +
    '<i ng-show="!row.entity.consumable" class="text-warning fa fa-times-circle-o fa-2x"></i>' +
    '</div>';

  // grid default options
  vm.gridOptions.appScopeProvider = vm;
  vm.gridOptions.enableFiltering  = vm.filterEnabled;
  vm.gridOptions.columnDefs       =
    [
      { field : 'code', displayName : 'Code'},
      { field : 'consumable', displayName : 'Consumable',
        cellTemplate : iconTemplate
      },
      { field : 'groupName', displayName : 'Groupe'},
      { field : 'label', displayName : 'Label'},
      { field : 'price', displayName : 'Price'},
      { field : 'type', displayName : 'Type'},
      { field : 'unit', displayName : 'Unit'},
      { field : 'action', displayName : '',
        cellTemplate: editTemplate,
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
  vm.printList = printList;

  /** initial setting start */
  startup();

  /** @todo: function for adding inventory items */
  function addInventoryItem() {
    return;
  }

  /** @todo: function for updating inventory item */
  function editInventoryItem(inventory) {
    return;
  }

  /** enable filter */
  function toggleFilter() {
    vm.filterEnabled = !vm.filterEnabled;
    vm.bcButtons[0].color = vm.filterEnabled ? 'btn-success' : 'btn-default';
    vm.gridOptions.enableFiltering = vm.filterEnabled;
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.ALL);
  }

  /** print inventory list */
  function printList() {
    var params = formaData(vm.gridOptions);
    return Modal.openPrinterData(params);
  }

  /**
   * format data for modal printer page
   * @fixme: need of server generate pdf because data
   * for inventory are very huge for the client
   */
  function formaData(gridOptions) {
    var headers = {};
    var rows = gridOptions.data;

    gridOptions.columnDefs.forEach(function (col) {
      headers[col.field] = col.displayName;
    });

    return {
      title : 'INVENTORY.LIST',
      headers : headers,
      rows : rows
    };
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
