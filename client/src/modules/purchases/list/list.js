angular.module('bhima.controllers')
  .controller('PurchaseListController', PurchaseListController);

PurchaseListController.$inject = [
  '$state', 'PurchaseOrderService', 'NotifyService', 'AppCache',
  'ReceiptModal', 'uiGridConstants',
  'GridColumnService', 'GridSortingService', 'bhConstants',
  'DepricatedFilterService', 'GridStateService', 'SessionService', 'ModalService'];

/**
 * Purchase Order Registry Controller
 *
 * This module is responsible for the management of Purchase Order Registry.
 */
function PurchaseListController($state, PurchaseOrder, Notify, AppCache,
  Receipts, uiGridConstants,
  Columns, Sorting, bhConstants, Filters, GridState, Session, Modal) {
  var vm = this;

  var filter = new Filters();
  vm.filter = filter;

  var cacheKey = 'PurchaseRegistry';
  var cache = AppCache(cacheKey);
  var FILTER_BAR_HEIGHT = bhConstants.grid.FILTER_BAR_HEIGHT;
  var state;

  vm.search = search;
  vm.filterBarHeight = {};
  vm.openColumnConfiguration = openColumnConfiguration;
  vm.gridApi = {};
  vm.onRemoveFilter = onRemoveFilter;
  vm.download = PurchaseOrder.download;

  vm.getDocument = getDocument;
  vm.editStatus = editStatus;  

  // track if module is making a HTTP request for purchase order
  vm.loading = false;

  var columnDefs = [{
    field                : 'reference',
    displayName          : 'FORM.LABELS.REFERENCE',
    headerCellFilter     : 'translate',
    aggregationType      : uiGridConstants.aggregationTypes.count,
    aggregationHideLabel : true,
  }, {
    field            : 'date',
    displayName      : 'FORM.LABELS.DATE',
    headerCellFilter : 'translate',
    cellFilter       : 'date',
  }, {
    field            : 'supplier',
    displayName      : 'FORM.LABELS.SUPPLIER',
    headerCellFilter : 'translate',
  }, {
    field            : 'note',
    displayName      : 'FORM.LABELS.DESCRIPTION',
    headerCellFilter : 'translate',
  }, {
    cellTemplate         : '/modules/purchases/templates/cellCost.tmpl.html',
    field                : 'cost',
    displayName          : 'FORM.LABELS.COST',
    headerCellFilter     : 'translate',
    footerCellFilter     : 'currency:'.concat(Session.enterprise.currency_id),
    aggregationType      : uiGridConstants.aggregationTypes.sum,
    aggregationHideLabel : true,
  }, {
    field            : 'author',
    displayName      : 'FORM.LABELS.AUTHOR',
    headerCellFilter : 'translate',
  }, {
    cellTemplate     : '/modules/purchases/templates/cellStatus.tmpl.html',
    field            : 'status',
    displayName      : 'FORM.LABELS.STATUS',
    headerCellFilter : 'translate',
    enableFiltering  : false,
    enableSorting    : false,
  }, {
    field           : 'action',
    displayName     : '',
    cellTemplate    : '/modules/purchases/templates/cellEdit.tmpl.html',
    enableFiltering : false,
    enableSorting   : false,
  }, {
    field            : 'uuid',
    cellTemplate     : '/modules/purchases/templates/cellDocument.tmpl.html',
    displayName      : 'FORM.LABELS.DOCUMENT',
    headerCellFilter : 'translate',
    enableFiltering  : false,
    enableSorting    : false,
  }];

  /** TODO manage column : last_transaction */
  vm.uiGridOptions = {
    appScopeProvider  : vm,
    showColumnFooter  : true,
    enableSorting     : true,
    enableColumnMenus : false,
    flatEntityAccess  : true,
    fastWatch         : true,
    columnDefs        : columnDefs,
  };

  var columnConfig = new Columns(vm.uiGridOptions, cacheKey);
  state = new GridState(vm.uiGridOptions, cacheKey);

  vm.saveGridState = state.saveGridState;
  vm.clearGridState = function clearGridState() {
    state.clearGridState();
    $state.reload();
  }  

  // error handler
  function handler(error) {
    vm.hasError = true;
    Notify.handleError(error);
  }

  function isEmpty(object) {
    return Object.keys(object).length === 0;
  }

  // get document
  function getDocument(uuid) {
    Receipts.purchase(uuid);
  }

  // edit status
  function editStatus(purchase) {
    Modal.openPurchaseOrderStatus(purchase)
    .then(load)
    .catch(Notify.handleError);
  }

  /** load purchase orders */
  function load(filters) {

    PurchaseOrder.search(filters)
      .then(function (purchases) {
        vm.uiGridOptions.data = purchases;
      })
      .catch(Notify.handleError);
  }

  function search() {
    var filtersSnapshot = PurchaseOrder.filters.formatHTTP();

    PurchaseOrder.openSearchModal(filtersSnapshot)
      .then(function (changes) {
        PurchaseOrder.filters.replaceFilters(changes);

        PurchaseOrder.cacheFilters();
        vm.latestViewFilters = PurchaseOrder.filters.formatView();
        return load(PurchaseOrder.filters.formatHTTP(true));
      });
  }

  // remove a filter with from the filter object, save the filters and reload
  function onRemoveFilter(key) {
    PurchaseOrder.removeFilter(key);
    PurchaseOrder.cacheFilters();
    vm.latestViewFilters = PurchaseOrder.filters.formatView();
    return load(PurchaseOrder.filters.formatHTTP(true));
  }

  function openColumnConfiguration() {
    columnConfig.openConfigurationModal();
  }

  // toggles the loading indicator on or off
  function toggleLoadingIndicator() {
    vm.loading = !vm.loading;
  }

  // startup function. Checks for cached filters and loads them.  This behavior could be changed.
  function startup() {
    if ($state.params.filters) {
      // Fix me, generate change dynamically 
      var change = [{ key : $state.params.filters.key, value : $state.params.filters.value }];

      PurchaseOrder.filters.replaceFilters(change);
      PurchaseOrder.cacheFilters();
    }

    load(PurchaseOrder.filters.formatHTTP(true));
    vm.latestViewFilters = PurchaseOrder.filters.formatView();
  }

  // fire up the module
  startup();
}
