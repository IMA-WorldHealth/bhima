angular.module('bhima.controllers')
.controller('JournalController', JournalController);

JournalController.$inject = [
  'JournalService', 'GridSortingService', 'GridGroupingService',
  'GridFilteringService', 'GridColumnService', 'JournalConfigService',
  'SessionService', 'NotifyService', 'TransactionService', 'GridEditorService',
  'bhConstants', '$state', 'uiGridConstants'
];

/**
 * @module JournalController
 *
 * @description
 * This controller is responsible for initialising the core client side posting
 * journal, binding the UI Grid component with services that facilitate all
 * operations required by an accountant.
 * - Displaying transactions in an easy to find and review format
 *   - Search for transactions
 *   - Filter transactions
 *   - Group by transactions to show aggregates
 *   - Sort transactions
 *   - Show or hide columns
 *
 * - (Super user) Edit and update transactions
 * - Post one or more transactions to the general ledger to confirm they are complete
 *   - Tun trial balance validation on transactions
 *
 * @todo Propose utility bar view design
 *
 * @module bhima/controllers/JournalController
 */
function JournalController(Journal, Sorting, Grouping, Filtering, Columns, Config, Session, Notify, Transactions, Editors, bhConstants, $state, uiGridConstants) {
  var vm = this;

  /** @constants */
  vm.ROW_EDIT_FLAG = bhConstants.transactions.ROW_EDIT_FLAG;
  vm.ROW_HIGHLIGHT_FLAG = bhConstants.transactions.ROW_HIGHLIGHT_FLAG;
  vm.ROW_INVALID_FLAG = bhConstants.transactions.ROW_INVALID_FLAG;

  // Journal utilities
  var sorting, grouping, filtering, columnConfig, transactions, editors;

  /** @const the cache alias for this controller */
  var cacheKey = 'Journal';

  vm.enterprise = Session.enterprise;

  // gridOptions is bound to the UI Grid and used to configure many of the
  // options, it is also used by the grid to expose the API
  vm.gridOptions = {
    enableColumnMenus : false,
    showColumnFooter : true,
    appScopeProvider : vm,
    rowTemplate: '/partials/templates/grid/transaction.row.html',
  };

  // Initialise each of the journal utilities, providing them access to the journal
  // configuration options
  sorting   = new Sorting(vm.gridOptions);
  filtering = new Filtering(vm.gridOptions, cacheKey);
  grouping  = new Grouping(vm.gridOptions, true);
  columnConfig = new Columns(vm.gridOptions, cacheKey);
  transactions = new Transactions(vm.gridOptions);
  editors = new Editors(vm.gridOptions);

  //attaching the grouping object to the view
  vm.grouping = grouping;

  //Attaching the transaction to the view
  vm.transactions = transactions;

  vm.loading = true;
  Journal.read()
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
  var columns = [
    { field : 'uuid', displayName : 'TABLE.COLUMNS.ID', headerCellFilter: 'translate', visible: false, enableCellEdit: false},
    { field : 'project_name', displayName : 'TABLE.COLUMNS.PROJECT', headerCellFilter: 'translate', visible: false, enableCellEdit: false },
    { field : 'period_end', displayName : 'TABLE.COLUMNS.PERIOD', headerCellFilter: 'translate' , cellTemplate : 'partials/templates/bhPeriod.tmpl.html', visible: false, enableCellEdit: false},
    {
      field : 'trans_date',
      displayName : 'TABLE.COLUMNS.DATE',
      headerCellFilter: 'translate',
      cellFilter : 'date:"mediumDate"',
      filter : { condition : filtering.byDate },
      editableCellTemplate: 'partials/journal/templates/date.edit.html',
      enableCellEdit: true,
      footerCellTemplate:'<i></i>'
    },
    { field : 'hrRecord', displayName : 'TABLE.COLUMNS.RECORD', headerCellFilter: 'translate', visible: true },
    { field : 'description', displayName : 'TABLE.COLUMNS.DESCRIPTION', headerCellFilter: 'translate', footerCellTemplate:'<i></i>' },
    { field : 'account_number', displayName : 'TABLE.COLUMNS.ACCOUNT', headerCellFilter: 'translate' },
    { field : 'debit_equiv', displayName : 'TABLE.COLUMNS.DEBIT', headerCellFilter: 'translate',
      cellTemplate : '/partials/templates/grid/debit_equiv.cell.html',
      aggregationType : uiGridConstants.aggregationTypes.sum,
      footerCellFilter : 'currency:grid.appScope.enterprise.currency_id'
    },
    { field : 'credit_equiv', displayName : 'TABLE.COLUMNS.CREDIT', headerCellFilter: 'translate',
      cellTemplate : '/partials/templates/grid/credit_equiv.cell.html',
      aggregationType : uiGridConstants.aggregationTypes.sum,
      footerCellFilter : 'currency:grid.appScope.enterprise.currency_id'
    },
    { field : 'trans_id',
      displayName : 'TABLE.COLUMNS.TRANSACTION',
      headerCellFilter: 'translate',
      sortingAlgorithm : sorting.transactionIds,
      sort : { priority : 0, direction : 'asc' },
      enableCellEdit: false,
      allowCellFocus: false,
      aggregationType : uiGridConstants.aggregationTypes.count
    },
    { field : 'currencyName', displayName : 'TABLE.COLUMNS.CURRENCY', headerCellFilter: 'translate', visible: false, enableCellEdit: false},
    { field : 'hrEntity', displayName : 'TABLE.COLUMNS.RECIPIENT', headerCellFilter: 'translate', visible: true},
    { field : 'hrReference', displayName : 'TABLE.COLUMNS.REFERENCE', headerCellFilter: 'translate', visible: true },
    { field : 'user', displayName : 'TABLE.COLUMNS.RESPONSIBLE', headerCellFilter: 'translate', visible: false, enableCellEdit: false },
    { field : 'actions', displayName : '', headerCellFilter: 'translate', visible: true, enableCellEdit: false, cellTemplate: '/partials/journal/templates/actions.cell.html', allowCellFocus: false }
  ];

  vm.gridOptions.columnDefs = columns;

  // This function opens a modal through column service to let the user show or Hide columns
  vm.openColumnConfigModal = function openColumnConfigModal() {
    Config.openColumnConfigModal(columnConfig);
  };

  //This function opens a modal, to let the user posting transaction to the general ledger
  vm.openTrialBalanceModal = function openTrialBalanceModal () {
    $state.go('trialBalanceMain', {records : vm.grouping.getSelectedGroups()}, {reload : false});
  };
}
