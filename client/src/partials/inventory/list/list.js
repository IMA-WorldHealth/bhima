angular.module('bhima.controllers')
  .controller('InventoryListController', InventoryListController);

// dependencies injection
InventoryListController.$inject = [
  '$translate', 'InventoryService', 'NotifyService', 'uiGridConstants',
  'ModalService', '$state', '$rootScope'
];

/**
 * Inventory List Controllers
 * This controller is responsible of the inventory list module
 */
function InventoryListController ($translate, Inventory, Notify, uiGridConstants, Modal, $state, $rootScope) {
  var vm = this;

  /** global variables */
  vm.filterEnabled = false;
  vm.gridOptions = {};
  vm.gridApi = {};

  vm.toggleFilter = toggleFilter;

  // grid default options
  var columnDefs  = [{
    field : 'code', displayName : 'FORM.LABELS.CODE', headerCellFilter : 'translate',
    aggregationType: uiGridConstants.aggregationTypes.count, aggregationHideLabel : true
  },{
    field : 'consumable', displayName : 'FORM.LABELS.CONSUMABLE', headerCellFilter : 'translate',
    cellTemplate : '/partials/inventory/list/templates/consumable.cell.tmpl.html'
  }, {
    field : 'groupName', displayName : 'FORM.LABELS.GROUP', headerCellFilter : 'translate'
  }, {
    field : 'label', displayName : 'FORM.LABELS.LABEL', headerCellFilter : 'translate'
  }, {
    field : 'price', displayName : 'FORM.LABELS.PRICE', headerCellFilter : 'translate', cellClass: 'text-right', type:'number'
  }, {
    field : 'type', displayName : 'FORM.LABELS.TYPE', headerCellFilter : 'translate'
  }, {
    field : 'unit', displayName : 'FORM.LABELS.UNIT', headerCellFilter : 'translate'
  }, {
    field : 'unit_weight', displayName : 'FORM.LABELS.WEIGHT', headerCellFilter : 'translate', cellClass: 'text-right', type:'number'
  }, {
    field : 'unit_volume', displayName : 'FORM.LABELS.VOLUME', headerCellFilter : 'translate', cellClass: 'text-right', type:'number'
  }, {
    field : 'action',
    displayName : '',
    cellTemplate: '/partials/inventory/list/templates/inventoryEdit.actions.tmpl.html',
    enableFiltering: false,
    enableSorting: false,
    enableColumnMenu: false,
  }];

  vm.gridOptions = {
    appScopeProvider : vm,
    enableFiltering  : vm.filterEnabled,
    showColumnFooter : true,
    fastWatch : true,
    flatEntityAccess : true,
    columnDefs: columnDefs,
    onRegisterApi : onRegisterApi
  };

  // API register function
  function onRegisterApi(gridApi) {
    vm.gridApi = gridApi;
  }

  /** initial setting start */
  startup();

  /** enable filter */
  function toggleFilter() {
    vm.filterEnabled = !vm.filterEnabled;
    vm.gridOptions.enableFiltering = vm.filterEnabled;
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
  }

  /* startup */
  function startup() {
    Inventory.read()
      .then(function (inventory) {
        vm.gridOptions.data = inventory;
      })
      .catch(Notify.handleError);
  }
}
