angular.module('bhima.controllers')
.controller('AccountStatementController', AccountStatementController);

// DI
AccountStatementController.$inject = [
  'GeneralLedgerService', 'NotifyService', 'JournalConfigService',
  'GridSortingService', 'GridFilteringService', 'GridColumnService',
  'SessionService', 'bhConstants', 'uiGridConstants', 'AccountStatementService',
  'Store', 'FilterService', 'ModalService', 'LanguageService',
  '$filter', 'GridExportService',
];

/**
 * @module AccountStatementController
 */
function AccountStatementController(GeneralLedger, Notify, Config,
  Sorting, Filtering, Columns, Session, bhConstants, uiGridConstants,
  AccountStatement, Store, Filters, Modal, Languages,
  $filter, GridExport) {
  // global variables
  var vm = this;
  var cacheKey = 'account-statement';

  // expose to the view
  vm.selectedRows = [];
  vm.enterprise = Session.enterprise;

  // grid definition ================================================================
  vm.gridApi = {};

  vm.gridOptions = {
    enableColumnMenus        : false,
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

  // attaching the filtering object to the view
  vm.filtering = filtering;

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

    { field            : 'account_number',
      displayName      : 'TABLE.COLUMNS.ACCOUNT',
      width            : 110,
      headerCellFilter : 'translate' },

    { field            : 'account_label',
      displayName      : 'FORM.LABELS.ACCOUNT_TITLE',
      headerCellFilter : 'translate' },

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
    vm.gridApi.selection.on.rowSelectionChanged(null, rowSelectionChanged);
    vm.gridApi.selection.on.rowSelectionChangedBatch(null, rowSelectionChanged);
  }

  // row selection changed
  function rowSelectionChanged() {
    vm.selectedRows = vm.gridApi.selection.getSelectedGridRows();
  }
  // end grid defintion =============================================================

  // comment selected rows
  vm.commentRows = function commentRows() {
    AccountStatement.openCommentModal({ rows : vm.selectedRows })
    .then(function (comment) {
      if (!comment) { return; }
      updateGridComment(vm.selectedRows, comment);
      Notify.success('ACCOUNT_STATEMENT.SUCCESSFULLY_COMMENTED');
    })
    .catch(Notify.handleError);
  };

  // update local rows
  function updateGridComment(rows, comment) {
    rows.forEach(function (row) {
      row.entity.comment = comment;
    });
  }

  // This function opens a modal through column service to let the user show or Hide columns
  vm.openColumnConfigModal = function openColumnConfigModal() {
    columnConfig.openConfigurationModal();
  };

  // open search modal
  vm.openSearchModal = function openSearchModal() {
    var filtersSnapshot = AccountStatement.filters.formatHTTP();

    Config.openSearchModal(filtersSnapshot, { hasDefaultAccount : true, title : 'ACCOUNT_STATEMENT.TITLE' })
      .then(function (changes) {
        AccountStatement.filters.replaceFilters(changes);

        AccountStatement.cacheFilters();
        vm.latestViewFilters = AccountStatement.filters.formatView();

        vm.loading = false;
        return load(AccountStatement.filters.formatHTTP(true));
      })
      .catch(Notify.handleError);
  };

  // remove a filter with from the filter object, save the filters and reload
  vm.onRemoveFilter = function onRemoveFilter(key) {
    AccountStatement.removeFilter(key);
    AccountStatement.cacheFilters();
    vm.latestViewFilters = AccountStatement.filters.formatView();
    return load(AccountStatement.filters.formatHTTP(true));
  };

  // exports zone =====================================================================

  // format parameters
  function formatExportParameters(type) {
    // make sure a row is selected before running the trial balance
    if (vm.gridApi.selection.getSelectedGridRows().length < 1) {
      Notify.warn('POSTING_JOURNAL.WARNINGS.NO_TRANSACTIONS_SELECTED');
      return;
    }

    var uuids = vm.gridApi.selection.getSelectedGridRows().map(function (row) {
      return row.entity.uuid;
    });
    return { renderer : type || 'pdf', lang : Languages.key, uuids: uuids };
  }

  // export pdf
  vm.exportPdf = function exportPdf() {
    var url = '/reports/finance/account_statement';
    var params = formatExportParameters('pdf');

    if (!params) { return; }
    Modal.openReports({ url : url, params : params });
  };

  // export csv
  vm.exportCsv = function exportCsv() {
    exportation.run();
  };
  // end exports zone =================================================================

  // runs on startup
  function startup() {
    load(AccountStatement.filters.formatHTTP(true));
    vm.latestViewFilters = AccountStatement.filters.formatView();
  }

  // startup
  function load(options) {
    vm.loading = true;
    vm.hasErrors = false;

    GeneralLedger.read(null, options)
    .then(function (data) {
      vm.gridOptions.data = data;
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
