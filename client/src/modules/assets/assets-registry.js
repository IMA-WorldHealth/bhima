angular.module('bhima.controllers')
  .controller('AssetsRegistryController', AssetsRegistryController);

AssetsRegistryController.$inject = [
  'StockService', 'NotifyService', 'uiGridConstants', 'StockModalService', 'ModalService',
  'LanguageService', 'GridGroupingService', 'GridStateService', 'GridColumnService',
  '$state', '$httpParamSerializer', 'BarcodeService', 'AssetsRegistryService', 'bhConstants',
  'ReceiptModal',
];

/**
 * Assets Registry Controller
 * This module is a registry page for assets
 */
function AssetsRegistryController(
  Stock, Notify, uiGridConstants, StockModal, Modal,
  Languages, Grouping, GridState, Columns,
  $state, $httpParamSerializer, Barcode, AssetsRegistry, bhConstants,
  Receipts,
) {
  const vm = this;
  const cacheKey = 'assets-grid';
  const stockLotFilters = Stock.filter.lot;
  const stockAssignmentFilters = Stock.filter.stockAssign;
  stockLotFilters.remove('includeEmptyLot'); // Cannot be empty lots for assets

  vm.bhConstants = bhConstants;

  // grouping box
  vm.groupingBox = AssetsRegistry.groupingBox;

  // barcode scanner
  vm.openAssetBarcodeScanner = openAssetBarcodeScanner;

  // show lot barcode
  vm.openLotBarcodeModal = openLotBarcodeModal;

  // options for the UI grid
  vm.gridOptions = {
    appScopeProvider : vm,
    enableColumnMenus : false,
    columnDefs : AssetsRegistry.columnDefs,
    enableSorting : true,
    showColumnFooter : true,
    fastWatch : true,
    flatEntityAccess : true,
    showGridFooter : true,
    gridFooterTemplate : AssetsRegistry.gridFooterTemplate,
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

  // edit asset
  vm.openAssetModal = (uuid) => {
    StockModal.openAssetEdit({ uuid })
      .then(ans => {
        if (!ans) { return; }
        load(stockLotFilters.formatHTTP(true));
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
    filters.is_asset = 1;
    if ('is_assigned' in filters) {
      filters.is_assigned = filters.is_assigned === 'ASSET.SHOW_ONLY_ASSIGNED' ? 1 : 0;
    }
    vm.hasError = false;
    toggleLoadingIndicator();

    Stock.lots.read(null, filters)
      .then((lots) => {
        lots.forEach((lot) => {
          // serialize tag names for filters
          lot.tagNames = lot.tags.map(tag => tag.name).join(',');
          lot.tags.forEach(addColorStyle);
        });

        // FIXME(@jniles): we should do this ordering on the server via an ORDER BY
        lots.sort(AssetsRegistry.orderByDepot);

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

    StockModal.openAssetsSearch(filtersSnapshot)
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

  /**
  * @method addAssignment
  *
  * @description
  * add a stock assignment to the entity
  *
  * @param {string} uuid
  */
  vm.addAssignment = function addAssignment(asset) {
    StockModal.openActionStockAssign({
      depot_uuid : asset.depot_uuid,
      inventory_uuid : asset.inventory_uuid,
      uuid : asset.uuid,
    })
      .then(() => {
        load(stockLotFilters.formatHTTP(true));
      });
  };

  /**
   * @method deleteAssignment
   *
   * @description
   * remove the stock assignment to the entity
   *
   * @param {string} uuid
   */
  vm.deleteAssignment = function deleteAssignment(uuid) {
    Modal.confirm('ASSIGN.CONFIRM_REMOVE_MSG')
      .then(ans => {
        if (!ans) { return; }

        Stock.stockAssign.remove(uuid)
          .then(() => {
            load(stockAssignmentFilters.formatHTTP(true));
            Notify.success('ASSIGN.REMOVE_SUCCESS');
          })
          .catch(errorHandler);
      });
  };

  // show the receipt
  vm.showAssignmentReceipt = (uuid) => {
    return Receipts.stockAssignmentReceipt(uuid);
  };

  // lot assignment historic
  vm.openHistoricModal = (uuid, depotUuid) => {
    StockModal.openAssignmentHistoric({ uuid, depotUuid });
  };

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
   * Show all the asset scans for this asset
   * @param {string} uuid - the asset UUID
   */
  vm.showAssetScans = (asset) => {
    $state.go('stockAssetsScans', {
      filters : [{
        key : 'asset_uuid',
        value : asset.uuid,
        displayValue : asset.label,
        cacheable : false,
      }],
    });
  };

  function openAssetBarcodeScanner() {
    Barcode.modal({ shouldSearch : false })
      .then(record => {
        stockLotFilters.replaceFilters([
          { key : 'barcode', value : record.uuid, displayValue : record.uuid },
        ]);

        load(stockLotFilters.formatHTTP(true));
        vm.latestViewFilters = stockLotFilters.formatView();
      });
  }

  /**
   * @description display the barcode of the lot in a modal
   * @param {string} uuid the lot uuid
   */
  function openLotBarcodeModal(uuid) {
    return Receipts.lotBarcodeReceipt(uuid);
  }

  startup();
}
