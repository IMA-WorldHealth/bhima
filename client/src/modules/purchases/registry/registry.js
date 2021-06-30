angular.module('bhima.controllers')
  .controller('PurchaseRegistryController', PurchaseRegistryController);

PurchaseRegistryController.$inject = [
  '$state', 'PurchaseOrderService', 'NotifyService', 'uiGridConstants',
  'GridColumnService', 'GridStateService', 'SessionService', 'ModalService',
  'ReceiptModal', 'bhConstants', 'BarcodeService',
];

/**
 * Purchase Order Registry Controller
 *
 * This module is responsible for the management of Purchase Order Registry.
 */
function PurchaseRegistryController(
  $state, PurchaseOrder, Notify, uiGridConstants,
  Columns, GridState, Session, Modal, ReceiptModal, bhConstants, Barcode,
) {
  const vm = this;
  const cacheKey = 'PurchaseRegistry';

  vm.search = search;
  vm.openColumnConfiguration = openColumnConfiguration;
  vm.gridApi = {};
  vm.toggleInlineFilter = toggleInlineFilter;
  vm.onRemoveFilter = onRemoveFilter;
  vm.download = PurchaseOrder.download;
  vm.status = bhConstants.purchaseStatus;
  vm.actions = bhConstants.actions;

  // barcode scanner
  vm.openBarcodeScanner = openBarcodeScanner;

  vm.openPurchaseOrderAnalysisReport = (uuid) => {
    const params = PurchaseOrder.openPurchaseOrderAnalysisReport(uuid);
    const link = `/reports/purchase_order_analysis?${params}`;
    return link;
  };

  vm.editStatus = editStatus;

  vm.FLUX_FROM_PURCHASE = bhConstants.flux.FROM_PURCHASE;

  const allowEditStatus = statusId => {
    const forbidden = [
      vm.status.RECEIVED,
      vm.status.PARTIALLY_RECEIVED,
      vm.status.EXCESSIVE_RECEIVED_QUANTITY,
    ];

    return !forbidden.includes(statusId);
  };

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

  vm.uiGridOptions = {
    appScopeProvider : vm,
    showColumnFooter : true,
    enableSorting : true,
    enableColumnMenus : false,
    flatEntityAccess : true,
    fastWatch : true,
    onRegisterApi : (api) => { vm.gridApi = api; },
    columnDefs,
  };

  const columnConfig = new Columns(vm.uiGridOptions, cacheKey);
  const state = new GridState(vm.uiGridOptions, cacheKey);

  vm.saveGridState = state.saveGridState;
  vm.clearGridState = function clearGridState() {
    state.clearGridState();
    $state.reload();
  };

  function toggleInlineFilter() {
    vm.uiGridOptions.enableFiltering = !vm.uiGridOptions.enableFiltering;
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
  }

  // error handler
  function handler(error) {
    vm.hasError = true;
    Notify.handleError(error);
  }

  vm.getDocument = (uuid) => ReceiptModal.purchase(uuid);

  // edit status
  function editStatus(purchase) {
    Modal.openPurchaseOrderStatus(purchase)
      .then((reload) => {
        if (reload) {
          load(PurchaseOrder.filters.formatHTTP(true));
        }
      })
      .catch(handler);
  }

  /* load purchase orders */
  function load(filters) {
    // flush error and loading states
    vm.hasError = false;
    toggleLoadingIndicator();

    PurchaseOrder.read(null, filters)
      .then((purchases) => {

        purchases.forEach(purchase => {
          purchase.hasStockMovement = !allowEditStatus(purchase.status_id);
        });

        vm.uiGridOptions.data = purchases;
      })
      .catch(handler)
      .finally(toggleLoadingIndicator);
  }

  function search() {
    const filtersSnapshot = PurchaseOrder.filters.formatHTTP();

    PurchaseOrder.openSearchModal(filtersSnapshot)
      .then((changes) => {
        if (!changes) {
          // Exit immediatly if the user closes the Search dialog with no changes
          return;
        }
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
    if ($state.params.filters.length) {
      PurchaseOrder.filters.replaceFiltersFromState($state.params.filters);
      PurchaseOrder.cacheFilters();
    }

    load(PurchaseOrder.filters.formatHTTP(true));
    vm.latestViewFilters = PurchaseOrder.filters.formatView();
  }

  vm.deletePurchaseOrder = deletePurchaseOrderWithConfirmation;
  function deletePurchaseOrderWithConfirmation(entity) {
    Modal.confirm('FORM.DIALOGS.CONFIRM_DELETE')
      .then((isOk) => {
        if (isOk) { remove(entity); }
      });
  }

  // allows users to delete purchase orders
  function remove(purchase) {
    PurchaseOrder.delete(purchase.uuid)
      .then(() => {
        Notify.success('FORM.INFO.DELETE_RECORD_SUCCESS');
        return load(PurchaseOrder.filters.formatHTTP(true));
      });
  }

  vm.allowRecordDeletion = function allowRecordDeletion(purchase) {
    return purchase.status_id === vm.status.WAITING_CONFIRMATION;
  };

  /**
   * @function searchByBarcode()
   *
   * @description
   * Opens the barcode scanner component and receives the record from the
   * modal.
   */
  function openBarcodeScanner() {
    Barcode.modal({ shouldSearch : true })
      .then(record => {
        PurchaseOrder.filters.replaceFilters([
          { key : 'uuid', value : record.uuid, displayValue : record.reference },
          { key : 'period', value : 'allTime' },
        ]);

        load(PurchaseOrder.filters.formatHTTP(true));
        vm.latestViewFilters = PurchaseOrder.filters.formatView();
      });

  }

  // fire up the module
  startup();
}
