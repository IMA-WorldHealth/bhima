angular.module('bhima.controllers')
.controller('PurchaseListController', PurchaseListController);

// dependencies injection
PurchaseListController.$inject = [
  '$translate', 'PurchaseOrderService', 'NotifyService', 'uiGridConstants', 'uiGridGroupingConstants',
  'ModalService', '$state', 'ReceiptModal', 'SessionService', 'LanguageService'
];

/**
 * Purchase Order List Controllers
 * This controller is responsible of the purchase list module
 */
function PurchaseListController ($translate, PurchaseOrder, Notify, uiGridConstants, uiGridGroupingConstants, Modal, $state, Receipts, Session, Languages) {
  var vm = this;

  /** gobal variables */
  vm.filters         = { lang: Languages.key };
  vm.formatedFilters = [];
  vm.enterprise      = Session.enterprise;
  vm.filterEnabled   = false;
  vm.loading         = false;
  vm.gridApi         = {};
  vm.gridOptions     = {};

  /** paths in the headercrumb */
  vm.bcPaths = [
    { label : 'TREE.PURCHASE' },
    { label : 'TREE.PURCHASE_REGISTRY' }
  ];

  /** buttons in the headercrumb */
  vm.bcButtons = [
    { icon: 'fa fa-search', label: $translate.instant('FORM.BUTTONS.SEARCH'),
      action: search, color: 'btn-default'
    }
  ];

  var columnDefs  = [
    { 
        field : 'reference', 
        displayName : 'FORM.LABELS.REFERENCE', 
        headerCellFilter : 'translate', 
        aggregationType: uiGridConstants.aggregationTypes.count },

    { 
        field : 'date', 
        displayName : 'FORM.LABELS.DATE', 
        headerCellFilter : 'translate', 
        cellFilter: 'date' },

    { 
        field : 'supplier', 
        displayName : 'FORM.LABELS.SUPPLIER', 
        headerCellFilter : 'translate' },

    { 
        field : 'note', 
        displayName : 'FORM.LABELS.DESCRIPTION', 
        headerCellFilter : 'translate' },

    { 
        cellTemplate: '/partials/purchases/templates/cellCost.tmpl.html',
        field : 'cost', 
        displayName : 'FORM.LABELS.COST', 
        headerCellFilter : 'translate', 
        footerCellFilter : 'currency:grid.appScope.enterprise.currency_id',
        aggregationType : uiGridConstants.aggregationTypes.sum,
        treeAggregationType: uiGridGroupingConstants.aggregation.sum },

    { 
        field : 'author', 
        displayName : 'FORM.LABELS.AUTHOR', 
        headerCellFilter : 'translate' },

    {
        cellTemplate: '/partials/purchases/templates/cellStatus.tmpl.html', 
        field : 'status', 
        displayName : 'FORM.LABELS.STATUS', 
        headerCellFilter : 'translate',
        enableFiltering: false,
        enableSorting: false },

    { 
        field : 'uuid', 
        cellTemplate : '/partials/purchases/templates/cellDocument.tmpl.html',
        displayName : 'FORM.LABELS.DOCUMENT', 
        headerCellFilter : 'translate',
        enableFiltering: false,
        enableSorting: false },

    {
      field : 'action',
      displayName : '',
      cellTemplate: '/partials/purchases/templates/cellEdit.tmpl.html',
      enableFiltering: false,
      enableSorting: false }
  ];

  vm.gridOptions = {
    appScopeProvider  : vm,
    enableFiltering   : vm.filterEnabled,
    showColumnFooter  : true,
    fastWatch         : true,
    flatEntityAccess  : true,
    columnDefs        : columnDefs,
    enableColumnMenus : false,
    onRegisterApi     : onRegisterApi
  };

  // API register function
  function onRegisterApi(gridApi) {
    vm.gridApi = gridApi;
  }

  /** expose to the view */
  vm.toggleFilter = toggleFilter;
  vm.getDocument = getDocument;
  vm.editStatus = editStatus;
  vm.search = search;

  /** initial setting start */
  startup();

  // search
  function search() {
    Modal.openSearchPurchaseOrder()
      .then(function (filters) {
        if (!filters) { return; }
        vm.filters = filters;
      })
      .catch(Notify.handleError);
  }

  // add purchase order 
  function addPurchaseOrder() {
    $state.go('/purchases/create');
  }

  // get document 
  function getDocument(uuid) {
    Receipts.purchase(uuid, true);
  }

  // edit status 
  function editStatus(purchase) {
    Modal.openPurchaseOrderStatus(purchase)
    .then(startup)
    .catch(Notify.handleError);
  }

   // on remove one filter
  function onRemoveFilter(key) {
    if (key === 'dateFrom' ||  key === 'dateTo') {
      // remove all dates filters if one selected
      delete vm.filters.identifiers.dateFrom;
      delete vm.filters.identifiers.dateTo;
      delete vm.filters.display.dateFrom;
      delete vm.filters.display.dateTo;
    } else {
      // remove the key
      delete vm.filters.identifiers[key];
      delete vm.filters.display[key];
    }
    reload(vm.filters);
  }

  // remove a filter with from the filter object, save the filters and reload
  function clearFilters() {
   
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
