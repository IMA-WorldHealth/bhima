angular.module('bhima.controllers')
.controller('AccountStatementController', AccountStatementController);

// DI
AccountStatementController.$inject = [
  'JournalService', 'GeneralLedgerService', 'NotifyService', 'JournalConfigService',
  'GridSortingService', 'GridFilteringService', 'GridColumnService',
  'SessionService', 'bhConstants', 'uiGridConstants',
  'AppCache', 'Store', 'FilterService',
  '$filter', '$translate', 'GridExportService',
];

/**
 * @module AccountStatementController
 */
function AccountStatementController(Journal, GeneralLedger, Notify, Config,
  Sorting, Filtering, Columns, Session, bhConstants, uiGridConstants,
  AppCache, Store, Filters, $filter, $translate, GridExport) {
  // global variables
  var vm = this;
  var cacheKey = 'account-statement';
  var cache = AppCache(cacheKey.concat('-module'));

  // expose to the view
  vm.filter = new Filters();
  vm.enterprise = Session.enterprise;

  // grid definition ================================================================
  vm.gridApi = {};

  vm.gridOptions = {
    enableColumnMenus        : false,
    enableCellEdit           : false,
    showColumnFooter         : true,
    appScopeProvider         : vm,
    flatEntityAccess         : true,
    enableRowHeaderSelection : true,
    onRegisterApi            : onRegisterApi,
  };

  // Initialise each of the account statement utilities
  var sorting = new Sorting(vm.gridOptions);
  var filtering = new Filtering(vm.gridOptions, cacheKey);
  var columnConfig = new Columns(vm.gridOptions, cacheKey);
  var exportation = new GridExport(vm.gridOptions, 'selected', 'visible');

  // columns definition
  var columns = [
    { field            : 'trans_id',
      displayName      : 'TABLE.COLUMNS.TRANSACTION',
      headerCellFilter : 'translate',
      sortingAlgorithm : sorting.transactionIds,
      width            : 110,
      cellTemplate     : 'modules/journal/templates/hide-groups-label.cell.html' },

    { field                : 'trans_date',
      displayName          : 'TABLE.COLUMNS.DATE',
      headerCellFilter     : 'translate',
      cellFilter           : 'date:"' + bhConstants.dates.format + '"',
      filter               : { condition : filtering.filterByDate },
      editableCellTemplate : 'modules/journal/templates/date.edit.html',
      footerCellTemplate   : '<i></i>' },

    { field                : 'account_number',
      displayName          : 'TABLE.COLUMNS.ACCOUNT',
      cellTemplate         : '/modules/journal/templates/account.cell.html',
      headerCellFilter     : 'translate' },

    {
      field            : 'debit_equiv',
      displayName      : 'TABLE.COLUMNS.DEBIT',
      headerCellFilter : 'translate',
      cellFilter       : 'currency:grid.appScope.enterprise.currency_id',
      cellClass        : 'text-right',
      enableFiltering  : true,
      aggregationType  : uiGridConstants.aggregationTypes.sum,
      footerCellFilter : 'currency:grid.appScope.enterprise.currency_id',
      footerCellClass  : 'text-right',
    },

    { field            : 'credit_equiv',
      displayName      : 'TABLE.COLUMNS.CREDIT',
      headerCellFilter : 'translate',
      cellFilter       : 'currency:grid.appScope.enterprise.currency_id',
      cellClass        : 'text-right',
      enableFiltering  : true,
      aggregationType  : uiGridConstants.aggregationTypes.sum,
      footerCellFilter : 'currency:grid.appScope.enterprise.currency_id',
      footerCellClass  : 'text-right',
    },

    { field              : 'description',
      displayName        : 'TABLE.COLUMNS.DESCRIPTION',
      headerCellFilter   : 'translate',
      visible            : false,
      footerCellTemplate : '<i></i>' },

    { field            : 'uuid',
      displayName      : 'TABLE.COLUMNS.ID',
      headerCellFilter : 'translate',
      visible          : false },

    { field            : 'project_name',
      displayName      : 'TABLE.COLUMNS.PROJECT',
      headerCellFilter : 'translate',
      visible          : false },

    { field            : 'period_end',
      displayName      : 'TABLE.COLUMNS.PERIOD',
      headerCellFilter : 'translate',
      cellTemplate     : 'modules/templates/bhPeriod.tmpl.html',
      visible          : false },

    { field                : 'hrRecord',
      displayName          : 'TABLE.COLUMNS.RECORD',
      headerCellFilter     : 'translate',
      visible              : false,
      footerCellTemplate   : '<i></i>' },

    { field            : 'currencyName',
      displayName      : 'TABLE.COLUMNS.CURRENCY',
      headerCellFilter : 'translate',
      visible          : false },

    { field            : 'debit',
      displayName      : 'TABLE.COLUMNS.DEBIT_SOURCE',
      headerCellFilter : 'translate',
      visible          : false,
      cellTemplate     : '/modules/journal/templates/debit.grid.html' },

    { field            : 'credit',
      displayName      : 'TABLE.COLUMNS.CREDIT_SOURCE',
      headerCellFilter : 'translate',
      visible          : false,
      cellTemplate     : '/modules/journal/templates/credit.grid.html' },

    { field                : 'hrEntity',
      displayName          : 'TABLE.COLUMNS.RECIPIENT',
      headerCellFilter     : 'translate',
      editableCellTemplate : '/modules/journal/templates/entity.edit.html',
      visible              : true },

    { field            : 'hrReference',
      displayName      : 'TABLE.COLUMNS.REFERENCE',
      headerCellFilter : 'translate',
      visible          : true },

    { field            : 'origin_id',
      displayName      : 'FORM.LABELS.TRANSACTION_TYPE',
      headerCellFilter : 'translate',
      cellTemplate     : '/modules/journal/templates/transaction_type.html',
      visible          : false },

    { field            : 'comment',
      displayName      : 'FORM.LABELS.COMMENT',
      headerCellFilter : 'translate',
      visible          : true },

    { field            : 'display_name',
      displayName      : 'TABLE.COLUMNS.RESPONSIBLE',
      headerCellFilter : 'translate',
      visible          : false },
  ];

  vm.gridOptions.columnDefs = columns;

  // on register api
  function onRegisterApi(api) {
    vm.gridApi = api;
  }
  // end grid defintion =============================================================

  // This function opens a modal through column service to let the user show or Hide columns
  vm.openColumnConfigModal = function openColumnConfigModal() {
    columnConfig.openConfigurationModal();
  };

  // open search modal
  vm.openSearchModal = function openSearchModal() {
    var filtersSnapshot = Journal.filters.formatHTTP();

    Config.openSearchModal(filtersSnapshot)
      .then(function (changes) {
        Journal.filters.replaceFilters(changes);

        Journal.cacheFilters();
        vm.latestViewFilters = Journal.filters.formatView();

        vm.loading = false;
        return load(Journal.filters.formatHTTP(true));
      })
      .catch(angular.noop);
  };

  // remove a filter with from the filter object, save the filters and reload
  vm.onRemoveFilter = function onRemoveFilter(key) {
    Journal.removeFilter(key);
    Journal.cacheFilters();
    vm.latestViewFilters = Journal.filters.formatView();
    return load(Journal.filters.formatHTTP(true));
  };

  // runs on startup
  function startup() {
    load(Journal.filters.formatHTTP(true));
    vm.latestViewFilters = Journal.filters.formatView();
  }

  // startup
  function load(options) {
    vm.loading = true;
    vm.hasErrors = false;

    GeneralLedger.read(null, options)
    .then(function (data) {
      vm.gridOptions.data = data;
      vm.loading = false;
    })
    .catch(handleError)
    .finally(function () {
      vm.loading = false;
    });
  }

  // catch loading errors
  function handleError(err) {
    Notify.handleError(err);
    vm.hasErrors = true;
  }

  startup();
}
