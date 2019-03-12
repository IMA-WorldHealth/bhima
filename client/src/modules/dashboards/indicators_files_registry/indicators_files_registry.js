angular.module('bhima.controllers')
  .controller('IndicatorsFilesRegistryController', IndicatorsFilesRegistryController);

IndicatorsFilesRegistryController.$inject = [
  '$state', 'NotifyService', 'uiGridConstants', 'GridColumnService',
  'GridStateService', 'LanguageService', 'ReceiptModal',
  'IndicatorsDashboardService',
];

function IndicatorsFilesRegistryController(
  $state, Notify, uiGridConstants, Columns, GridState,
  Languages, Receipts, IndicatorsDashboard,
) {
  const vm = this;

  const cacheKey = 'AdmissionRegistry';

  // the grid registry filterer
  const grid = IndicatorsDashboard.indicatorsFilesGridFilterer;

  vm.loading = false;
  vm.search = search;
  vm.openColumnConfiguration = openColumnConfiguration;
  vm.onRemoveFilter = onRemoveFilter;
  vm.languageKey = Languages.key;
  vm.toggleInlineFilter = toggleInlineFilter;

  const columnDefs = [{
    field : 'fiscal_year_label',
    displayName : 'DASHBOARD.INDICATORS_FILES.FISCAL_YEAR',
    headerCellFilter : 'translate',
  }, {
    field : 'period_label',
    displayName : 'DASHBOARD.INDICATORS_FILES.PERIOD',
    headerCellFilter : 'translate',
  }, {
    field : 'type_label',
    displayName : 'DASHBOARD.INDICATORS_FILES.TYPE',
    headerCellFilter : 'translate',
  }, {
    field : 'status',
    displayName : 'DASHBOARD.INDICATORS_FILES.STATUS',
    headerCellFilter : 'translate',
  }, {
    field : 'validated',
    displayName : 'DASHBOARD.INDICATORS_FILES.VALIDATED',
    headerCellFilter : 'translate',
  }, {
    field : 'last_edit_display_name',
    displayName : 'DASHBOARD.INDICATORS_FILES.LAST_EDIT',
    headerCellFilter : 'translate',
  }, {
    name : 'actions',
    displayName : '',
    cellTemplate : '/modules/dashboards/indicators_files_registry/templates/action.cell.html',
    enableSorting : false,
    enableFiltering : false,
  }];

  vm.uiGridOptions = {
    appScopeProvider : vm,
    showGridFooter : true,
    enableSorting : true,
    enableColumnMenus : false,
    flatEntityAccess : true,
    fastWatch : true,
    columnDefs,
  };

  vm.uiGridOptions.onRegisterApi = function onRegisterApi(gridApi) {
    vm.gridApi = gridApi;
  };

  function toggleInlineFilter() {
    vm.uiGridOptions.enableFiltering = !vm.uiGridOptions.enableFiltering;
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
  }
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

  // this function loads admissions from the database with search filters, if passed in.
  function load(filters) {

    // flush error and loading states
    vm.hasError = false;
    vm.loading = true;

    // hook the returned admissions up to the grid.
    return IndicatorsDashboard.indicatorsFiles.read(null, filters)
      .then((admissions) => {
        // put data in the grid
        vm.uiGridOptions.data = admissions;
        // grid : update view filters
        vm.latestViewFilters = grid.latestViewFilters();
      })
      .catch(handler)
      .finally(() => {
        toggleLoadingIndicator();
      });
  }

  // grid : on startup
  function startup() {
    grid.startup($state.params, load);
  }

  // grid : search modal
  function search() {
    grid.search(IndicatorsDashboard.openIndicatorsFilesSearchModal, load);
  }

  // grid : on remove a filter
  function onRemoveFilter(key) {
    grid.onRemoveFilter(key, load);
  }

  function openColumnConfiguration() {
    columnConfig.openConfigurationModal();
  }

  // toggles the loading indicator on or off
  function toggleLoadingIndicator() {
    vm.loading = !vm.loading;
  }

  // fire up the module
  startup();
}
