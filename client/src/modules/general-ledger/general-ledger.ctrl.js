angular.module('bhima.controllers')
  .controller('GeneralLedgerController', GeneralLedgerController);

GeneralLedgerController.$inject = [
  'GeneralLedgerService', 'GridSortingService', 'GridGroupingService',
  'GridFilteringService', 'GridColumnService',
  'SessionService', 'NotifyService', 'TransactionService', 'uiGridConstants',
  'AppCache', 'LanguageService', 'ExportService',
];

/**
 * @module GeneralLedgerController
 *
 * @description
 * This controller is responsible for initialising the core client side general ledger,
 * binding the UI Grid component with services that facilitate all
 * operations required by an accountant without editing.
 * - Displaying transactions in an easy to find and review format
 *   - Search for transactions
 *   - Filter transactions
 *   - Group by transactions to show aggregates
 *   - Sort transactions
 *   - Show or hide columns
 *
 */
function GeneralLedgerController(GeneralLedger, Sorting, Grouping,
  Filtering, Columns, Session, Notify, Transactions,
  uiGridConstants, AppCache, Languages, Export) {
  var vm = this;

  // General Ledger utilities
  var sorting;
  var grouping;
  var filtering;
  var columnConfig;
  var transactions;

  /** @const the cache alias for this controller */
  var cacheKey = 'GeneralLedger';

  vm.gridApi = {};
  vm.enterprise = Session.enterprise;

  // gridOptions is bound to the UI Grid and used to configure many of the
  // options, it is also used by the grid to expose the API
  vm.gridOptions = {
    fastWatch         : true,
    enableColumnMenus : false,
    showColumnFooter  : true,
    appScopeProvider  : vm,
    onRegisterApi     : onRegisterApiFn,
  };

  function onRegisterApiFn(gridApi) {
    vm.gridApi = gridApi;
  }

  // Initialise each of the general ledger utilities, providing them access to the general ledger
  // configuration options
  sorting = new Sorting(vm.gridOptions);
  filtering = new Filtering(vm.gridOptions, cacheKey);
  grouping = new Grouping(vm.gridOptions, true);
  columnConfig = new Columns(vm.gridOptions, cacheKey);

  // attaching the filtering object to the view
  vm.filtering = filtering;

  // attaching the grouping object to the view
  vm.grouping = grouping;

  vm.loading = true;

  GeneralLedger.read()
    .then(function (records) {
      vm.gridOptions.data = records;
    })
    .catch(function (error) {
      vm.hasError = true;
      Notify.handleError(error);
    })
    .finally(toggleLoadingIndicator);


  /**
   * @function toggleLoadingIndicator
   *
   * @description
   * Toggles the grid's loading indicator to eliminate the flash when rendering
   * transactions and allow a better UX for slow loads.
   */
  function toggleLoadingIndicator() {
    vm.loading = !vm.loading;
  }

  /**
   * Column definitions; specify the configuration and behaviour for each column
   * in the journal grid. Initialise each of the journal utilities,
   * providing them access to the journal
   * configuration options :
   *    sorting = new Sorting(vm.gridOptions);
   *    grouping = new Grouping(vm.gridOptions);
   *    filtering  = new Filtering(vm.gridOptions);
   *
   * Note:
   *   1. Setting the grouping priority without sorting by the same column will
   *      cause unexpected behaviour (splitting up of groups) when sorting
   *      other columns. This can be avoided by setting default sort and group.
   */
  var columnDefs = [
    { field            : 'uuid',
      displayName      : 'TABLE.COLUMNS.ID',
      headerCellFilter : 'translate',
      visible          : false,
      enableCellEdit   : false },

    { field            : 'project_name',
      displayName      : 'TABLE.COLUMNS.PROJECT',
      headerCellFilter : 'translate',
      visible          : false,
      enableCellEdit   : false },

    { field            : 'period_end',
      displayName      : 'TABLE.COLUMNS.PERIOD',
      headerCellFilter : 'translate',
      cellTemplate     : 'modules/templates/bhPeriod.tmpl.html',
      visible          : false,
      enableCellEdit   : false },

    { field              : 'trans_date',
      displayName        : 'TABLE.COLUMNS.DATE',
      headerCellFilter   : 'translate',
      cellFilter         : 'date:"mediumDate"',
      filter             : { condition: filtering.filterByDate },
      footerCellTemplate : '<i></i>' },

    { field              : 'description',
      displayName        : 'TABLE.COLUMNS.DESCRIPTION',
      headerCellFilter   : 'translate',
      footerCellTemplate : '<i></i>' },

    { field            : 'account_number',
      displayName      : 'TABLE.COLUMNS.ACCOUNT',
      headerCellFilter : 'translate' },

    { field            : 'debit_equiv',
      displayName      : 'TABLE.COLUMNS.DEBIT',
      headerCellFilter : 'translate',
      cellTemplate     : '/modules/templates/grid/debit_equiv.cell.html',
      aggregationType  : uiGridConstants.aggregationTypes.sum,
      footerCellFilter : 'currency:grid.appScope.enterprise.currency_id' },

    { field            : 'credit_equiv',
      displayName      : 'TABLE.COLUMNS.CREDIT',
      headerCellFilter : 'translate',
      cellTemplate     : '/modules/templates/grid/credit_equiv.cell.html',
      aggregationType  : uiGridConstants.aggregationTypes.sum,
      footerCellFilter : 'currency:grid.appScope.enterprise.currency_id' },

    { field            : 'trans_id',
      displayName      : 'TABLE.COLUMNS.TRANSACTION',
      headerCellFilter : 'translate',
      sortingAlgorithm : sorting.transactionIds,
      sort             : { priority: 0, direction: 'asc' },
      enableCellEdit   : false,
      allowCellFocus   : false },

    // @todo this should be formatted as a currency icon vs. an ID
    { field            : 'currency_id',
      displayName      : 'TABLE.COLUMNS.CURRENCY',
      headerCellFilter : 'translate',
      visible          : false,
      enableCellEdit   : false },

    // @todo this should be formatted showing the debtor/creditor
    { field            : 'entity_uuid',
      displayName      : 'TABLE.COLUMNS.RECIPIENT',
      headerCellFilter : 'translate',
      visible          : false },

    { field            : 'reference_uuid',
      displayName      : 'TABLE.COLUMNS.REFERENCE',
      headerCellFilter : 'translate',
      visible          : false },

    { field            : 'record_uuid',
      displayName      : 'TABLE.COLUMNS.RECORD',
      headerCellFilter : 'translate',
      visible          : false },

    { field            : 'user',
      displayName      : 'TABLE.COLUMNS.RESPONSIBLE',
      headerCellFilter : 'translate',
      visible          : false,
      enableCellEdit   : false },
  ];

  vm.gridOptions.columnDefs = columnDefs;

  // This function opens a modal through column service to let the user show or Hide columns
  vm.openColumnConfigModal = function openColumnConfigModal() {
    columnConfig.openConfigurationModal();
  };

  // format Export Parameters
  function formatExportParameters(type) {
    // make sure a row is selected before running the trial balance
    if (grouping.selectedRowCount < 1) {
      Notify.warn('POSTING_JOURNAL.WARNINGS.NO_TRANSACTIONS_SELECTED');
      return;
    }

    var uuids = vm.grouping.getSelectedGroups().map(function (trans) {
      return trans.uuid;
    });

    return { renderer: type || 'pdf', lang: Languages.key, uuids: uuids };
  }

  // display the journal printable report of selected transactions
  vm.openJournalReport = function openJournalReport(renderer) {
    var url = '/reports/finance/posted_journal';
    var renderer_ = renderer || pdf;
    var params = formatExportParameters(renderer_);

    if (!params) { return; }

    Export.download(url, params, 'POSTING_JOURNAL.TITLE', 'print');
  };

  // export data into csv file
  vm.exportFile = function exportFile() {
    var url = '/reports/finance/posted_journal';
    var params = formatExportParameters('csv');

    if (!params) { return; }

    Export.download(url, params, 'POSTING_JOURNAL.TITLE');
  };
}
