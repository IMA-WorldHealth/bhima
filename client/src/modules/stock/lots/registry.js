angular.module('bhima.controllers')
  .controller('StockLotsController', StockLotsController);

StockLotsController.$inject = [
  'StockService', 'NotifyService', 'uiGridConstants', 'StockModalService', 'LanguageService',
  'GridGroupingService', 'GridStateService', 'GridColumnService', '$state', '$httpParamSerializer',
  'BarcodeService', 'LotService', 'LotsRegistryService', 'moment', 'bhConstants',
];

/**
 * Stock lots Controller
 * This module is a registry page for stock lots
 */
function StockLotsController(
  Stock, Notify, uiGridConstants, Modal, Languages,
  Grouping, GridState, Columns, $state, $httpParamSerializer,
  Barcode, LotService, LotsRegistry, moment, bhConstants,
) {
  const vm = this;
  const cacheKey = 'lot-grid';
  const stockLotFilters = Stock.filter.lot;

  vm.bhConstants = bhConstants;

  // grouping box
  vm.groupingBox = LotsRegistry.groupingBox;

  // barcode scanner
  vm.openBarcodeScanner = openBarcodeScanner;

  // options for the UI grid
  vm.gridOptions = {
    appScopeProvider : vm,
    enableColumnMenus : false,
    columnDefs : LotsRegistry.columnDefs,
    enableSorting : true,
    showColumnFooter : true,
    fastWatch : true,
    flatEntityAccess : true,
    rowTemplate : '/modules/stock/lots/templates/row.expired.html',
    showGridFooter : true,
    gridFooterTemplate : LotsRegistry.gridFooterTemplate,
    onRegisterApi,
  };

  const gridColumns = new Columns(vm.gridOptions, cacheKey);
  const state = new GridState(vm.gridOptions, cacheKey);

  // expose to the view model
  vm.grouping = new Grouping(vm.gridOptions, false, 'depot_text', true, true);

  vm.getQueryString = Stock.getQueryString;
  vm.clearGridState = clearGridState;
  vm.search = search;
  vm.openColumnConfigModal = openColumnConfigModal;
  vm.loading = false;
  vm.saveGridState = state.saveGridState;

  function onRegisterApi(gridApi) {
    vm.gridApi = gridApi;
  }

  // count data rows
  vm.countGridRows = () => vm.gridOptions.data.length;

  // select group
  vm.selectGroup = (group) => {
    if (!group) { return; }
    vm.selectedGroup = group;
  };

  // toggle group
  vm.toggleGroup = (column) => {
    if (vm.grouped) {
      vm.grouping.removeGrouping(column);
      vm.grouped = false;
    } else {
      vm.grouping.changeGrouping(column);
      vm.grouped = true;
    }
  };

  // edit lot
  vm.openLotModal = (uuid) => {
    Modal.openEditLot({ uuid })
      .then(ans => {
        if (!ans) { return; }
        load(stockLotFilters.formatHTTP(true));
      });
  };

  // lot assignment historic
  vm.openHistoricModal = (uuid, depotUuid) => {
    Modal.openAssignmentHistoric({ uuid, depotUuid });
  };

  // lot duplicates modal
  vm.openDuplicatesModal = (uuid, depotUuid) => {
    Modal.openDuplicateLotsModal({ uuid, depotUuid })
      .then((res) => {
        if (res === 'success') {
          // Reload the lot registry since some lots were merged
          load(stockLotFilters.formatHTTP(true));
        }
      });
  };

  // lot schedule modal
  vm.openLotScheduleModal = (uuid, inventoryUuid, depotUuid) => {
    Modal.openLotScheduleModal({ uuid, inventoryUuid, depotUuid })
      .then((/* res */) => {
        // Do nothing since this modal does not change anything
      });
  };

  // initialize module
  function startup() {
    if ($state.params.filters.length) {
      stockLotFilters.replaceFiltersFromState($state.params.filters);
      stockLotFilters.formatCache();
    }

    load(stockLotFilters.formatHTTP(true));
    vm.latestViewFilters = stockLotFilters.formatView();
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
   * lots movements and allow a better UX for slow loads.
   */
  function toggleLoadingIndicator() {
    vm.loading = !vm.loading;
  }

  // load stock lots in the grid
  function load(filters) {
    vm.hasError = false;
    toggleLoadingIndicator();

    Stock.lots.read(null, filters)
      .then((lots) => {
        const current = new Date();

        const totals = {
          expired : 0,
          'at-risk-of-expiring' : 0,
          'at-risk-of-stock-out' : 0,
          'out-of-stock' : 0,
        };

        lots.forEach((lot) => {
          const delay = moment(new Date(lot.expiration_date)).diff(current);
          lot.delay_expiration = moment.duration(delay).humanize(true);

          if (lot.expired) {
            totals.expired += 1;
          }

          if (lot.at_risk_of_stock_out) {
            totals['at-risk-of-stock-out'] += 1;
          }

          if (lot.near_expiration) {
            totals['at-risk-of-expiring'] += 1;
          }

          if (lot.exhausted) {
            totals['out-of-stock'] += 1;
          }

          // serialize tag names for filters
          lot.tagNames = lot.tags.map(tag => tag.name).join(',');
          lot.tags.forEach(addColorStyle);
        });

        vm.totals = totals;

        lots.forEach(LotsRegistry.formatLotsWithoutExpirationDate);

        // FIXME(@jniles): we should do this ordering on the server via an ORDER BY
        lots.sort(LotsRegistry.orderByDepot);

        vm.gridOptions.data = lots;

        vm.grouping.unfoldAllGroups();
        vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
      })
      .catch(errorHandler)
      .finally(toggleLoadingIndicator);
  }

  function addColorStyle(tag) {
    tag.style = { color : tag.color };
  }

  // remove a filter with from the filter object, save the filters and reload
  vm.onRemoveFilter = function onRemoveFilter(key) {
    stockLotFilters.remove(key);
    stockLotFilters.formatCache();
    vm.latestViewFilters = stockLotFilters.formatView();
    return load(stockLotFilters.formatHTTP(true));
  };

  function search() {
    const filtersSnapshot = stockLotFilters.formatHTTP();

    Modal.openSearchLots(filtersSnapshot)
      .then((changes) => {
        stockLotFilters.replaceFilters(changes);
        stockLotFilters.formatCache();
        vm.latestViewFilters = stockLotFilters.formatView();
        return load(stockLotFilters.formatHTTP(true));
      });
  }

  // This function opens a modal through column service to let the user toggle
  // the visibility of the lots registry's columns.
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
    const filterOpts = stockLotFilters.formatHTTP();
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

  vm.exportTo = (renderer) => {
    const filterOpts = stockLotFilters.formatHTTP();
    const defaultOpts = {
      renderer,
      lang : Languages.key,
    };
    const options = angular.merge(defaultOpts, filterOpts);
    // return  serialized options
    return $httpParamSerializer(options);
  };

  vm.toggleInlineFilter = () => {
    vm.gridOptions.enableFiltering = !vm.gridOptions.enableFiltering;
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
  };

  /**
   * @function openBarcodeScanner
   *
   * @description
   * Opens the barcode scanner component and receives the record from the
   * modal.
   */
  function openBarcodeScanner() {
    Barcode.modal({ shouldSearch : false })
      .then(record => {
        stockLotFilters.replaceFilters([
          { key : 'inventory_uuid', value : record.uuid, displayValue : record.reference },
        ]);

        load(stockLotFilters.formatHTTP(true));
        vm.latestViewFilters = stockLotFilters.formatView();
      });
  }

  startup();
}
