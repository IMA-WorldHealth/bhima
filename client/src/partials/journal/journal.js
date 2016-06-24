angular.module('bhima.controllers')
.controller('JournalController', JournalController);

JournalController.$inject = [
  'TransactionService', 'JournalService', 'JournalSortingService', 'JournalGroupingService',
  'JournalPaginationService', 'JournalFilteringService', 'JournalColumnConfigService',
  'NotifyService'
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
 *   - Show or Hide columns
 *
 * - (Super user) Edit and update transactions
 * - Post one or more transactions to the general ledger to confirm they are complete
 *   - Tun trial balance validation on transactions
 *
 * @todo Propose design for services plugging in and configuring aspects of the grid
 * @todo Develop a mock transaction service to provide example data to test with
 * @todo Popoulate models/test/data.sql with test transactions data
 * @todo Propose utility bar view design
 *
 * @module bhima/controllers/JournalController
 */
function JournalController(Transactions, Journal, Sorting, Grouping, Pagination, Filtering, ColumnConfig, Notify) {
  var vm = this;

  // Journal utilites
  var sorting, grouping, pagination, filtering, columnConfig;

  //column list
  var columns = null;


  // gridOptions is bound to the UI Grid and used to configure many of the
  // options, it is also used by the grid to expose the API
  vm.gridOptions = {};

  // Initialise each of the journal utilites, providing them access to the journal
  // configuration options
  sorting    = new Sorting(vm.gridOptions);
  filtering  = new Filtering(vm.gridOptions);
  grouping   = new Grouping(vm.gridOptions);
  pagination = new Pagination(vm.gridOptions, Transactions.list.data);
  columnConfig = new ColumnConfig(vm.gridOptions);



  // bind the transactions service to populate the grid component

  // Popoulate the grid with posting journal data
  Journal.read()
  .then(function (list) {
    vm.gridOptions.data = list;
  })
  .catch(Notify.errorHandler);

  /**
   * Column defintions; specify the configuration and behaviour for each column
   * in the journal grid. Initialise each of the journal utilities,
   * providing them access to the journal
   * configuration options :
   *    sorting = new Sorting(vm.gridOptions);
   *    pagination = new Pagination(vm.gridOptions, Transactions.list.data);
   *    grouping = new Grouping(vm.gridOptions);
   *    filtering  = new Filtering();
   *
   * Note:
   *   1. Setting the grouping priority without sorting by the same column will
   *      cause unexpected behaviour (splitting up of groups) when sorting
   *      other columns. This can be avoided by setting default sort and group.
   *
   *   2. To avoid some unmeaningfull column, we are using column such as project_name,
   *      account_number, ... instead of project_id, account_id so the request to fetch data
   *      should be a join to get expected columns name
   *
   *  @todo using ui-grid internazation if necessary for columns label
  */

  columns = [
    { field : 'uuid', displayName : 'TABLE.COLUMNS.ID', headerCellFilter: 'translate' },
    { field : 'project_name', displayName : 'TABLE.COLUMNS.PROJECT', headerCellFilter: 'translate' },
    { field : 'period_end', displayName : 'TABLE.COLUMNS.PERIOD', headerCellFilter: 'translate' , cellTemplate : 'partials/templates/bhPeriod.tmpl.html' },
    { field : 'trans_date', displayName : 'TABLE.COLUMNS.DATE', headerCellFilter: 'translate' , cellFilter : 'date:"mediumDate"', filter : { condition : filtering.byDate } },
    { field : 'description', displayName : 'TABLE.COLUMNS.DESCRIPTION', headerCellFilter: 'translate' },
    { field : 'account_number', displayName : 'TABLE.COLUMNS.ACCOUNT', headerCellFilter: 'translate' },
    { field : 'debit_equiv', displayName : 'TABLE.COLUMNS.DEBIT', headerCellFilter: 'translate'  },
    { field : 'credit_equiv', displayName : 'TABLE.COLUMNS.CREDIT', headerCellFilter: 'translate' },
    { field : 'trans_id',
      displayName : 'TABLE.COLUMNS.TRANSACTION',
      headerCellFilter: 'translate' ,
      sortingAlgorithm : sorting.transactionIds,
      sort : { priority : 0, direction : 'asc' },
      grouping : { groupPriority : 0 }
    },

    // @todo this should be formatted as a currency icon vs. an ID
    { field : 'currency_id', displayName : 'TABLE.COLUMNS.CURRENCY', headerCellFilter: 'translate' },

    // @todo this should be formatted showing the debitor/credior
    { field : 'entity_uuid', displayName : 'TABLE.COLUMNS.RECIPIENT', headerCellFilter: 'translate' },
    { field : 'entity_type', displayName : 'TABLE.COLUMNS.RECIPIENT_TYPE', headerCellFilter: 'translate' },

    { field : 'reference_uuid', displayName : 'TABLE.COLUMNS.REFERENCE', headerCellFilter: 'translate' },
    { field : 'record_uuid', displayName : 'TABLE.COLUMNS.RECORD', headerCellFilter: 'translate' },
    { field : 'user', displayName : 'TABLE.COLUMNS.RESPONSIBLE', headerCellFilter: 'translate' },

    // @fixme this field should not come from the database as 'cc'
    { field : 'cc_id', displayName : 'TABLE.COLUMNS.COST_CENTER', headerCellFilter: 'translate' },
    { field : 'pc_id', displayName : 'TABLE.COLUMNS.PROFIT_CENTER', headerCellFilter: 'translate' }
  ];

  vm.gridOptions.columnDefs = columns;


  // This function opens a modal through column service to let the user show or Hide columns
  vm.openColumnConfigModal = function openColumnConfigModal() {
    columnConfig.openColumnConfigModal();
  };

}
