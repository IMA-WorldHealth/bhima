angular.module('bhima.controllers')
  .controller('StockLotsAssignController', StockLotsAssignController);

StockLotsAssignController.$inject = [
  'StockService', 'NotifyService',
  'uiGridConstants', 'StockModalService', 'LanguageService', 'GridGroupingService',
  'GridStateService', 'GridColumnService', '$state', '$httpParamSerializer',
];

/**
 * Stock lots Assignments Controller
 * This module is a registry page for stock lots assignments
 */
function StockLotsAssignController(
  Stock, Notify,
  uiGridConstants, Modal, Languages, Grouping,
  GridState, Columns, $state, $httpParamSerializer,
) {
  const vm = this;
  const cacheKey = 'lot-assign-grid';
  const filterKey = 'lot-assign';
  const gridFilter = Stock.filter.lotAssign;

  // grouping box
  vm.groupingBox = [
    { label : 'STOCK.DEPOT', value : 'depot_text' },
    { label : 'STOCK.INVENTORY', value : 'text' },
    { label : 'ENTITY.LABEL', value : 'entity_display_name' },
  ];

  // grid columns
  const columns = [
    {
      field : 'depot_text',
      displayName : 'STOCK.DEPOT',
      headerCellFilter : 'translate',
    },

    {
      field : 'code',
      displayName : 'STOCK.CODE',
      headerCellFilter : 'translate',
    },

    {
      field : 'text',
      displayName : 'STOCK.INVENTORY',
      headerCellFilter : 'translate',
    },

    {
      field : 'label',
      displayName : 'STOCK.LOT',
      headerCellFilter : 'translate',
    },

    {
      field : 'entity_display_name',
      displayName : 'ENTITY.LABEL',
      headerCellFilter : 'translate',
    },

    {
      field : 'quantity',
      displayName : 'STOCK.QUANTITY',
      headerCellFilter : 'translate',
    },

    {
      field : 'date',
      displayName : 'FORM.LABELS.DATE',
      headerCellFilter : 'translate',
      cellFilter : 'date',
    },

    {
      field : 'action',
      displayName : '',
      enableFiltering : false,
      enableSorting : false,
      cellTemplate : 'modules/stock/assign/templates/action.cell.html',
    },
  ];

  const gridFooterTemplate = `
    <div>
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
  vm.grouping = new Grouping(vm.gridOptions, true, 'depot_text', false, true);
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
  vm.countGridRows = () => {
    return vm.gridOptions.data.length;
  };

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

  // initialize module
  function startup() {
    if ($state.params.filters.length) {
      gridFilter.replaceFiltersFromState($state.params.filters);
      Stock.cacheFilters(filterKey);
    }

    load(gridFilter.formatHTTP(true));
    vm.latestViewFilters = gridFilter.formatView();
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

    // no negative or empty lot
    filters.includeEmptyLot = 0;

    Stock.lots.read(null, filters)
      .then((lots) => {
        vm.gridOptions.data = lots;
        vm.grouping.unfoldAllGroups();
      })
      .catch(errorHandler)
      .finally(toggleLoadingIndicator);
  }

  // remove a filter with from the filter object, save the filters and reload
  vm.onRemoveFilter = function onRemoveFilter(key) {
    Stock.removeFilter(filterKey, key);

    Stock.cacheFilters(filterKey);
    vm.latestViewFilters = gridFilter.formatView();

    return load(gridFilter.formatHTTP(true));
  };

  function search() {
    const filtersSnapshot = gridFilter.formatHTTP();

    Modal.openSearchLots(filtersSnapshot)
      .then((changes) => {
        gridFilter.replaceFilters(changes);
        Stock.cacheFilters(filterKey);
        vm.latestViewFilters = gridFilter.formatView();

        return load(gridFilter.formatHTTP(true));
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

    const filterOpts = gridFilter.formatHTTP();
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
