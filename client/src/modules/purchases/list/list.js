angular.module('bhima.controllers')
  .controller('PurchaseListController', PurchaseListController);

PurchaseListController.$inject = [
  '$state', 'PurchaseOrderService', 'NotifyService', 'uiGridConstants',
  'GridColumnService', 'GridStateService', 'SessionService', 'ModalService',
  'ReceiptModal',
];

/**
 * Purchase Order Registry Controller
 *
 * This module is responsible for the management of Purchase Order Registry.
 */
function PurchaseListController(
  $state, PurchaseOrder, Notify, uiGridConstants,
  Columns, GridState, Session, Modal, ReceiptModal
) {
  const vm = this;
  const cacheKey = 'PurchaseRegistry';

  vm.search = search;
  vm.openColumnConfiguration = openColumnConfiguration;
  vm.gridApi = {};
  vm.onRemoveFilter = onRemoveFilter;
  vm.download = PurchaseOrder.download;

  vm.editStatus = editStatus;

  // track if module is making a HTTP request for purchase order
  vm.loading = false;

  const columnDefs = [{
    field : 'reference',
    displayName : 'FORM.LABELS.REFERENCE',
    headerCellFilter : 'translate',
    cellTemplate : 'modules/purchases/templates/uuid.tmpl.html',
    aggregationType : uiGridConstants.aggregationTypes.count,
    aggregationHideLabel : true,
  }, {
    field : 'date',
    displayName : 'FORM.LABELS.DATE',
    headerCellFilter : 'translate',
    cellFilter : 'date',
  }, {
    field : 'supplier',
    displayName : 'FORM.LABELS.SUPPLIER',
    headerCellFilter : 'translate',
  }, {
    field : 'note',
    displayName : 'FORM.LABELS.DESCRIPTION',
    headerCellFilter : 'translate',
  }, {
    cellTemplate : '/modules/purchases/templates/cellCost.tmpl.html',
    field : 'cost',
    displayName : 'FORM.LABELS.COST',
    headerCellFilter : 'translate',
    footerCellFilter : 'currency:'.concat(Session.enterprise.currency_id),
    aggregationType : uiGridConstants.aggregationTypes.sum,
    aggregationHideLabel : true,
  }, {
    field : 'author',
    displayName : 'FORM.LABELS.AUTHOR',
    headerCellFilter : 'translate',
  }, {
    cellTemplate : '/modules/purchases/templates/cellStatus.tmpl.html',
    field : 'status',
    displayName : 'FORM.LABELS.STATUS',
    headerCellFilter : 'translate',
    enableFiltering : false,
    enableSorting : false,
  }, {
    field : 'action',
    displayName : '...',
    enableFiltering : false,
    enableColumnMenu : false,
    enableSorting : false,
    cellTemplate : 'modules/purchases/templates/action.cell.html',
  }];

  /** TODO manage column : last_transaction */
  vm.uiGridOptions = {
    appScopeProvider : vm,
    showColumnFooter : true,
    enableSorting : true,
    enableColumnMenus : false,
    flatEntityAccess : true,
    fastWatch : true,
    columnDefs,
  };

  const columnConfig = new Columns(vm.uiGridOptions, cacheKey);
  const state = new GridState(vm.uiGridOptions, cacheKey);

  vm.saveGridState = state.saveGridState;
  vm.clearGridState = function clearGridState() {
    state.clearGridState();
    $state.reload();
  };

  // error handler
  function handler(error) {
    vm.hasError = true;
    Notify.handleError(error);
  }

  vm.getDocument = (uuid) => {
    ReceiptModal.purchase(uuid);
  };

  // edit status
  function editStatus(purchase) {
    Modal.openPurchaseOrderStatus(purchase)
      .then(() => {
        return load(PurchaseOrder.filters.formatHTTP(true));
      })
      .catch(handler);
  }

  /** load purchase orders */
  function load(filters) {
    // flush error and loading states
    vm.hasError = false;
    toggleLoadingIndicator();

    PurchaseOrder.read(null, filters)
      .then((purchases) => {
        vm.uiGridOptions.data = purchases;
      })
      .catch(handler)
      .finally(toggleLoadingIndicator);
  }

  function search() {
    const filtersSnapshot = PurchaseOrder.filters.formatHTTP();

    PurchaseOrder.openSearchModal(filtersSnapshot)
      .then((changes) => {
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
    load(PurchaseOrder.filters.formatHTTP(true));
    vm.latestViewFilters = PurchaseOrder.filters.formatView();
  }

  // fire up the module
  startup();
}
