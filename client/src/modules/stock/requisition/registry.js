angular.module('bhima.controllers')
  .controller('StockRequisitionController', StockRequisitionController);

StockRequisitionController.$inject = [
  'StockService', 'NotifyService', 'ModalService', 'ReceiptModal',
  'uiGridConstants', 'StockModalService', 'LanguageService',
  'GridStateService', 'GridColumnService', '$state', '$httpParamSerializer',
];

/**
 * Stock Requisition Controller
 * This controller is responsible of requisition registry
 */
function StockRequisitionController(
  Stock, Notify, Modal, Receipts,
  uiGridConstants, StockModal, Languages,
  GridState, Columns, $state, $httpParamSerializer,
) {
  const vm = this;
  const cacheKey = 'stock-requisition-grid';
  const stockRequisitionFilters = Stock.filter.requisition;

  // grid columns
  const columns = [
    {
      field : 'requestor_uuid',
      displayName : 'REQUISITION.RECEIVER',
      headerCellFilter : 'translate',
      cellTemplate : 'modules/stock/requisition/templates/requestor.cell.html',
    },

    {
      field : 'reference',
      displayName : 'FORM.LABELS.REFERENCE',
      headerCellFilter : 'translate',
    },

    {
      field : 'depot_text',
      displayName : 'STOCK.DEPOT',
      headerCellFilter : 'translate',
    },

    {
      field : 'date',
      displayName : 'FORM.LABELS.DATE',
      headerCellFilter : 'translate',
      cellFilter : 'date',
    },

    {
      field : 'user_display_name',
      displayName : 'FORM.LABELS.USER',
      headerCellFilter : 'translate',
    },

    {
      field : 'status_key',
      displayName : 'FORM.LABELS.STATUS',
      headerCellFilter : 'translate',
      cellTemplate : 'modules/stock/requisition/templates/status.cell.html',
    },

    {
      field : 'action',
      displayName : '',
      enableFiltering : false,
      enableSorting : false,
      cellTemplate : 'modules/stock/requisition/templates/action.cell.html',
    },
  ];

  const gridFooterTemplate = `
    <div style="padding-left: 10px;">
      <b>{{ grid.appScope.countGridRows() }}</b> 
      <span translate>TABLE.AGGREGATES.ROWS</span>
    </div>
  `;

  // options for the UI grid
  vm.gridOptions = {
    appScopeProvider : vm,
    enableColumnMenus : false,
    columnDefs : columns,
    enableSorting : true,
    showColumnFooter : true,
    fastWatch : true,
    flatEntityAccess : true,
    showGridFooter : true,
    gridFooterTemplate,
    onRegisterApi,
  };

  const gridColumns = new Columns(vm.gridOptions, cacheKey);
  const state = new GridState(vm.gridOptions, cacheKey);

  // expose to the view model
  vm.getQueryString = Stock.getQueryString;
  vm.clearGridState = clearGridState;
  vm.search = search;
  vm.openColumnConfigModal = openColumnConfigModal;
  vm.loading = false;
  vm.saveGridState = state.saveGridState;
  vm.removeRequisition = removeRequisition;
  vm.showReceipt = showReceipt;

  function onRegisterApi(gridApi) {
    vm.gridApi = gridApi;
  }

  // count data rows
  vm.countGridRows = () => {
    return vm.gridOptions.data.length;
  };

  // initialize module
  function startup() {
    if ($state.params.filters.length) {
      stockRequisitionFilters.replaceFiltersFromState($state.params.filters);
      stockRequisitionFilters.formatCache();
    }

    load(stockRequisitionFilters.formatHTTP(true));
    vm.latestViewFilters = stockRequisitionFilters.formatView();
  }

  /**
   * @function errorHandler
   *
   * @description
   * Uses Notify to show an error in case the server sends back an information.
   * Triggers the error state on the grid.
   */
  function errorHandler(error) {
    vm.hasError = true;
    Notify.handleError(error);
  }

  /**
   * @function toggleLoadingIndicator
   *
   * @description
   * Toggles the grid's loading indicator to eliminate the flash when rendering
   * requisitions movements and allow a better UX for slow loads.
   */
  function toggleLoadingIndicator() {
    vm.loading = !vm.loading;
  }

  /**
   * @method removeRequisition
   *
   * @description
   * remove the stock requisitionment to the entity
   *
   * @param {string} uuid
   */
  function removeRequisition(uuid) {
    Modal.confirm('REQUISITION.CONFIRM_REMOVE_MSG')
      .then(ans => {
        if (!ans) { return; }

        Stock.stockRequisition.delete(uuid)
          .then(() => {
            load(stockRequisitionFilters.formatHTTP(true));
            Notify.success('REQUISITION.REMOVE_SUCCESS');
          })
          .catch(errorHandler);
      });
  }

  // show the receipt
  function showReceipt(uuid) {
    return Receipts.stockRequisitionReceipt(uuid);
  }

  // load stock requisitions in the grid
  function load(filters) {
    vm.hasError = false;
    toggleLoadingIndicator();

    // no negative or empty lot
    filters.includeEmptyLot = 0;

    Stock.stockRequisition.read(null, filters)
      .then((requisitions) => {
        vm.gridOptions.data = requisitions;
      })
      .catch(errorHandler)
      .finally(toggleLoadingIndicator);
  }

  // remove a filter with from the filter object, save the filters and reload
  vm.onRemoveFilter = function onRemoveFilter(key) {
    stockRequisitionFilters.remove(key);
    stockRequisitionFilters.formatCache();
    vm.latestViewFilters = stockRequisitionFilters.formatView();
    return load(stockRequisitionFilters.formatHTTP(true));
  };

  function search() {
    const filtersSnapshot = stockRequisitionFilters.formatHTTP();

    StockModal.openSearchStockRequisition(filtersSnapshot)
      .then((changes) => {
        stockRequisitionFilters.replaceFilters(changes);
        stockRequisitionFilters.formatCache();
        vm.latestViewFilters = stockRequisitionFilters.formatView();
        return load(stockRequisitionFilters.formatHTTP(true));
      });
  }

  // This function opens a modal through column service to let the user toggle
  // the visibility of the requisitions registry's columns.
  function openColumnConfigModal() {
    // column configuration has direct access to the grid API to alter the current
    // state of the columns - this will be saved if the user saves the grid configuration
    gridColumns.openConfigurationModal();
  }

  // saves the grid's current configuration
  function clearGridState() {
    state.clearGridState();
    $state.reload();
  }

  vm.downloadExcel = () => {
    const filterOpts = stockRequisitionFilters.formatHTTP();
    const defaultOpts = {
      renderer : 'xlsx',
      lang : Languages.key,
      renameKeys : true,
      displayNames : gridColumns.getDisplayNames(),
    };
    // combine options
    const options = angular.merge(defaultOpts, filterOpts);
    // return  serialized options
    return $httpParamSerializer(options);
  };

  vm.toggleInlineFilter = () => {
    vm.gridOptions.enableFiltering = !vm.gridOptions.enableFiltering;
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
  };

  startup();
}
