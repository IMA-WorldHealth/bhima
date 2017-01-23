angular.module('bhima.controllers')
.controller('PurchaseListController', PurchaseListController);

// dependencies injection
PurchaseListController.$inject = [
  '$translate', 'PurchaseOrderService', 'NotifyService', 'uiGridConstants',
  'ModalService', '$state', 'ReceiptModal'
];

/**
 * Purchase Order List Controllers
 * This controller is responsible of the purchase list module
 */
function PurchaseListController ($translate, PurchaseOrder, Notify, uiGridConstants, Modal, $state, Receipts) {
  var vm = this;

  /** gobal variables */
  vm.filterEnabled = false;
  vm.gridOptions = {};
  vm.gridApi = {};

  /** paths in the headercrumb */
  vm.bcPaths = [
    { label : 'TREE.PURCHASE' },
    { label : 'TREE.PURCHASE_REGISTRY' }
  ];

  /** buttons in the headercrumb */
  vm.bcButtons = [
    { icon: 'fa fa-filter', label: $translate.instant('FORM.BUTTONS.FILTER'),
      action: toggleFilter, color: 'btn-default'
    },
    { icon: 'fa fa-plus', label: $translate.instant('FORM.LABELS.ADD'),
      action: addPurchaseOrder, color: 'btn-default',
      dataMethod: 'create'
    }
  ];

  var columnDefs  = [
    { field : 'reference', displayName : 'FORM.LABELS.REFERENCE', headerCellFilter : 'translate' },
    { field : 'date', displayName : 'FORM.LABELS.DATE', headerCellFilter : 'translate', cellFilter: 'date' },
    { field : 'supplier', displayName : 'FORM.LABELS.SUPPLIER', headerCellFilter : 'translate' },
    { field : 'note', displayName : 'FORM.LABELS.DESCRIPTION', headerCellFilter : 'translate' },
    { field : 'cost', displayName : 'FORM.LABELS.COST', headerCellFilter : 'translate', cellFilter: 'currency:row.entity.currency_id' },
    { field : 'author', displayName : 'FORM.LABELS.AUTHOR', headerCellFilter : 'translate' },
    { 
        field : 'uuid', 
        cellTemplate : '/partials/purchases/templates/cellDocument.tmpl.html',
        displayName : 'FORM.LABELS.DOCUMENT', 
        headerCellFilter : 'translate' 
    },
    {
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
    fastWatch : true,
    flatEntityAccess : true,
    columnDefs: columnDefs,
    onRegisterApi : onRegisterApi
  };

  // API register function
  function onRegisterApi(gridApi) {
    vm.gridApi = gridApi;
  }

  /** expose to the view */
  vm.toggleFilter = toggleFilter;
  vm.getDocument = getDocument;

  /** initial setting start */
  startup();

  // add purchase order 
  function addPurchaseOrder() {
      $state.go('/purchases/create');
  }

  // get document 
  function getDocument(uuid) {
      Receipts.purchase(uuid, true);
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
    PurchaseOrder.read(null, { detailed: 1 })
      .then(function (purchases) {
        vm.gridOptions.data = purchases;
      })
      .catch(Notify.handleError);
  }
}
