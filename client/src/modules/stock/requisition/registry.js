angular.module('bhima.controllers')
  .controller('StockRequisitionController', StockRequisitionController);

StockRequisitionController.$inject = [
  '$state', 'StockService', 'NotifyService',
  'ModalService', 'ReceiptModal',
  'uiGridConstants', 'StockModalService',
  'GridStateService', 'GridColumnService',
];

/**
 * Stock Requisition Controller
 * This controller is responsible of requisition registry
 */
function StockRequisitionController(
  $state, Stock, Notify, Modal, Receipts,
  uiGridConstants, StockModal,
  GridState, Columns,
) {

  const vm = this;
  const cacheKey = 'stock-requisition-grid';
  const stockRequisitionFilters = Stock.filter.requisition;

  vm.status = [];

  vm.editStatus = editStatus;

  // grid columns
  const columns = [
    {
      field : 'reference',
      displayName : 'FORM.LABELS.REFERENCE',
      headerCellFilter : 'translate',
      cellTemplate : 'modules/stock/requisition/templates/reference.cell.html',
    },

    {
      field : 'requestor_uuid',
      displayName : 'REQUISITION.RECEIVER',
      headerCellFilter : 'translate',
      cellTemplate : 'modules/stock/requisition/templates/requestor.cell.html',
    },

    {
      field : 'depot_text',
      displayName : 'STOCK.DEPOT',
      headerCellFilter : 'translate',
    },

    {
      field : 'description',
      displayName : 'TABLE.COLUMNS.DESCRIPTION',
      headerCellFilter : 'translate',
    },

    {
      field : 'date',
      displayName : 'FORM.LABELS.DATE',
      headerCellFilter : 'translate',
      cellFilter : 'date: \'dd MMM yyyy - HH:mm:ss\'',
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
      filterHeaderTemplate : 'modules/stock/requisition/templates/status.filter.html',
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

  vm.onClearStatusFilter = (col) => {
    delete col.term;
  };

  // edit status
  function editStatus(requisition) {
    Modal.requisitionStatus(requisition)
      .then(() => {
        return load(stockRequisitionFilters.filters.formatHTTP(true));
      })
      .catch(errorHandler);
  }

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
  vm.loading = false;
  vm.getQueryString = Stock.getQueryString;
  vm.saveGridState = state.saveGridState;

  /**
   * @method countGridRows
   *
   * @description
   * count the total number of rows in the requisition registry grid
   */
  vm.countGridRows = () => {
    return vm.gridOptions.data.length;
  };

  /**
   * @method removeRequisition
   *
   * @description
   * remove a stock requisition by its uuid by executing a deletion query in the database
   *
   * @param {string} uuid
   */
  vm.removeRequisition = uuid => {
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
  };

  /**
   * @method showReceipt
   *
   * @description
   * display the requisition receipt
   *
   * @param {string} uuid
   */
  vm.showReceipt = uuid => {
    return Receipts.stockRequisitionReceipt(uuid);
  };

  /**
   * @method onRemoveFilter
   *
   * @description
   * remove a filter with from the filter object, save the filters and reload
   *
   * @param {string} key
   */
  vm.onRemoveFilter = function onRemoveFilter(key) {
    stockRequisitionFilters.remove(key);
    stockRequisitionFilters.formatCache();
    vm.latestViewFilters = stockRequisitionFilters.formatView();
    return load(stockRequisitionFilters.formatHTTP(true));
  };

  /**
   * @method onChangeDepot
   *
   * @description
   * action to perform when a depot is changed
   *
   * @param {object} depot
   */
  vm.onChangeDepot = depot => {
    vm.depot = depot;
  };

  /**
   * @method search
   *
   * @description
   * display the search modal
   */
  vm.search = () => {
    const filtersSnapshot = stockRequisitionFilters.formatHTTP();

    StockModal.openSearchStockRequisition(filtersSnapshot)
      .then((changes) => {
        stockRequisitionFilters.replaceFilters(changes);
        stockRequisitionFilters.formatCache();
        vm.latestViewFilters = stockRequisitionFilters.formatView();
        return load(stockRequisitionFilters.formatHTTP(true));
      });
  };

  /**
   * @method openColumnConfigModal
   *
   * @description
   * display the column configuration modal
   */
  vm.openColumnConfigModal = () => {
    gridColumns.openConfigurationModal();
  };

  /**
   * @method clearGridState
   *
   * @description
   * reset the grid state
   */
  vm.clearGridState = () => {
    state.clearGridState();
    $state.reload();
  };

  /**
   * @method toggleInlineFilter
   *
   * @description
   * enable/disable the grid columns filter
   */
  vm.toggleInlineFilter = () => {
    vm.gridOptions.enableFiltering = !vm.gridOptions.enableFiltering;
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
  };

  /**
   * @method onRegisterApi
   *
   * @description
   * ui-grid api exposer
   */
  function onRegisterApi(gridApi) {
    vm.gridApi = gridApi;
  }

  /**
   * @method startup
   *
   * @description
   * action to perform when the page is loaded
   */
  function startup() {
    Stock.status.read().then(rows => {
      vm.status = rows.map(s => {
        return {
          value : s.status_key,
          label : s.title_key,
        };
      });

    });

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
   * @method load
   *
   * @description load requisition into the registry grid
   *
   * @param {object} filters
   */
  function load(filters) {
    vm.hasError = false;
    vm.loading = true;

    Stock.stockRequisition.read(null, filters)
      .then((requisitions) => {
        vm.gridOptions.data = requisitions;
      })
      .catch(errorHandler)
      .finally(() => {
        vm.loading = false;
      });
  }

  startup();

}
