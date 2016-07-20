angular.module('bhima.controllers')
.controller('JournalController', JournalController);

JournalController.$inject = [
  'JournalService', 'GridSortingService', 'GridGroupingService',
  'GridFilteringService', 'GridColumnService', 'JournalConfigService',
  'SessionService', 'NotifyService'
];

/**
 * Posting Journal Controller
 *
 * This controller is responsible for initialising the core client side posting
 * journal, binding the UI Grid component with services that facilitate all
 * operations required by an accounted.
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
function JournalController(Journal, Sorting, Grouping, Filtering, Columns, Config, Session, Notify) {
  var vm = this;

  // Journal utilities
  var sorting, grouping, filtering, columnConfig;

  /** @const the cache alias for this controller */
  var cacheKey = 'Journal';

  vm.enterprise = Session.enterprise;

  // gridOptions is bound to the UI Grid and used to configure many of the
  // options, it is also used by the grid to expose the API
  vm.gridOptions = {
    enableColumnMenus : false,
    appScopeProvider : vm
  };

  // Initialise each of the journal utilities, providing them access to the journal
  // configuration options
  sorting   = new Sorting(vm.gridOptions);
  filtering = new Filtering(vm.gridOptions, cacheKey);
  grouping  = new Grouping(vm.gridOptions);
  columnConfig = new Columns(vm.gridOptions, cacheKey);

  // Populate the grid with posting journal data
  Journal.read()
  .then(function (list) {
    vm.gridOptions.data = list;
  })
  .catch(Notify.errorHandler);

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
    { field : 'uuid', displayName : 'TABLE.COLUMNS.ID', headerCellFilter: 'translate', visible: false },
    { field : 'project_name', displayName : 'TABLE.COLUMNS.PROJECT', headerCellFilter: 'translate', visible: false },
    { field : 'period_end', displayName : 'TABLE.COLUMNS.PERIOD', headerCellFilter: 'translate' , cellTemplate : 'partials/templates/bhPeriod.tmpl.html', visible: false },
    { field : 'trans_date', displayName : 'TABLE.COLUMNS.DATE', headerCellFilter: 'translate' , cellFilter : 'date:"mediumDate"', filter : { condition : filtering.byDate } },
    { field : 'description', displayName : 'TABLE.COLUMNS.DESCRIPTION', headerCellFilter: 'translate' },
    { field : 'account_number', displayName : 'TABLE.COLUMNS.ACCOUNT', headerCellFilter: 'translate' },
    { field : 'debit_equiv', displayName : 'TABLE.COLUMNS.DEBIT', headerCellFilter: 'translate', cellTemplate : '/partials/journal/templates/debit_equiv.html' },
    { field : 'credit_equiv', displayName : 'TABLE.COLUMNS.CREDIT', headerCellFilter: 'translate', cellTemplate : '/partials/journal/templates/credit_equiv.html' },
    { field : 'trans_id',
      displayName : 'TABLE.COLUMNS.TRANSACTION',
      headerCellFilter: 'translate' ,
      sortingAlgorithm : sorting.transactionIds,
      sort : { priority : 0, direction : 'asc' },
    },

    // @todo this should be formatted as a currency icon vs. an ID
    { field : 'currency_id', displayName : 'TABLE.COLUMNS.CURRENCY', headerCellFilter: 'translate', visible: false },

    // @todo this should be formatted showing the debtor/creditor
    { field : 'entity_uuid', displayName : 'TABLE.COLUMNS.RECIPIENT', headerCellFilter: 'translate', visible: false },
    { field : 'entity_type', displayName : 'TABLE.COLUMNS.RECIPIENT_TYPE', headerCellFilter: 'translate', visible: false },

    { field : 'reference_uuid', displayName : 'TABLE.COLUMNS.REFERENCE', headerCellFilter: 'translate', visible: false },
    { field : 'record_uuid', displayName : 'TABLE.COLUMNS.RECORD', headerCellFilter: 'translate', visible: false },
    { field : 'user', displayName : 'TABLE.COLUMNS.RESPONSIBLE', headerCellFilter: 'translate', visible: false }
  ];

  vm.gridOptions.columnDefs = columns;

  // This function opens a modal through column service to let the user show or Hide columns
  vm.openColumnConfigModal = function openColumnConfigModal() {
    Config.openColumnConfigModal(columnConfig);
  };
}
