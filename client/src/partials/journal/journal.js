angular.module('bhima.controllers')
.controller('JournalController', JournalController);

JournalController.$inject = [
  'TransactionService', 'JournalSortingService', 'JournalGroupingService',
  'JournalPaginationService', 'JournalFilteringService', 'JournalColumnConfigService', 'AppCache', '$uibModal'
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
function JournalController(Transactions, Sorting, Grouping, Pagination, Filtering, ColumnConfig, AppCache, Modal) {
  var vm = this;

  // Journal utilites
  var sorting, grouping, pagination, filtering, columnConfig;

  //column list
  var columns = null; 

  //An appcache instance
  var cache = AppCache('JournalGrid');

  // gridOptions is bound to the UI Grid and used to configure many of the
  // options, it is also used by the grid to expose the API
  vm.gridOptions = {};

  // Initialise each of the journal utilites, providing them access to the journal
  // configuration options
  columnConfig = new ColumnConfig(vm.gridOptions); //This service should be responsible of initializing columns?
  sorting    = new Sorting(vm.gridOptions);
  grouping   = new Grouping(vm.gridOptions);
  pagination = new Pagination(vm.gridOptions, Transactions.list.data);
  filtering  = new Filtering(vm.gridOptions);

  // bind the transactions service to populate the grid component
  vm.gridOptions.data = Transactions.list.data;
 
  /**
   * Column defintions; specify the configuration and behaviour for each column
   * in the journal grid. Initialise each of the journal utilities,
   * providing them access to the journal
   * configuration options :
   *    sorting = new Sorting(vm.gridOptions);
   *    pagination = new Pagination(vm.gridOptions, Transactions.list.data);
   *    grouping = new Grouping(vm.gridOptions);
   *    filtering  = new Filtering();
   *    columnConfig = new ColumnConfig(vm.gridOptions);   *    
   * Note:
   *   Setting the grouping priority without sorting by the same column will
   *   cause unexpected behaviour (splitting up of groups) when sorting
   *   other columns. This can be avoided by setting default sort and group.
   *  @todo using ui-grid internazation if necessary for columns label
   */

    columns = [
      { field : 'uuid', displayName : 'ID', visible : false },
      { field : 'project_name', displayName : 'Project', visible : false },
      { field : 'period_summary', displayName : 'Period', visible : false },
      { field : 'doc_num', displayName : 'Doc Num', visible : false},
      { field : 'trans_date', displayName : 'Date', cellFilter : 'date:"mediumDate"', filter : { condition : filtering.byDate }, visible : true },
      { field : 'description', displayName : 'Description', visible : true },
      { field : 'account_number', displayName : 'Account', visible : true },
      { field : 'debit_equiv', displayName : 'Debit', visible : true },
      { field : 'credit_equiv', displayName : 'Credit', visible : true },
      { field : 'trans_id', 
        displayName : 'Transaction', 
        sortingAlgorithm : sorting.transactionIds,
        sort : { priority : 0, direction : 'asc' },
        grouping : { groupPriority : 0 }, 
        visible : true
      },
    
      // @todo this should be formatted as a currency icon vs. an ID
      { field : 'currency_id', displayName : 'Currency', visible: false },
      
      // @todo this should be formatted showing the debitor/credior
      { field : 'deb_cred_uuid', displayName : 'Recipient', visible : false }, 
      { field : 'deb_cred_type', displayName : 'Recipient Type', visible : false }, 

      // @fixme inv_po_id -> reference
      { field : 'inv_po_id', displayName : 'Reference Document', visible : false },
      { field : 'user', displayName : 'Responsible', visible : false },
      
      // @fixme this field should not come from the database as 'cc'
      { field : 'cc', displayName : 'Cost Center', visible : false },
      { field : 'pc', displayName : 'Profit Center', visible : false }
    ];

    vm.gridOptions.columnDefs = cache.columns ? resetColumns(cache.columns) : columns;

    // This function opens a modal to let the user show or Hide columns
    vm.openColumnConfigModal = function openColumnConfigModal() {

      var instance = Modal.open({
        templateUrl: 'partials/journal/modals/columnsConfig.modal.html',
        controller:  'ColumnsConfigModalController as ColumnsConfigModalCtrl',
        size:        'md',
        backdrop:    'static',
        animation:   true,
        resolve:     {
          columnList:  function columnListProvider() { return vm.gridOptions.columnDefs; },
          defaultColumns : function defaultColumnListProvider () { return angular.copy(columns);}
        }
      });

      instance.result.then(function (result) {
        vm.gridOptions.columnDefs = result.columns;
        columnConfig.refreshColumns();
        cache.columns = result.columns;
      });
    };

  /**
  * This method is there to fix problem caused by fetching column from cache
  * When columns are fetched from cache, sorting functionnality does not work
  * this function is there to reset this functionnality
  *
  * @todo This is a lazy solution, we must refactor our cache module or redesign our posting journal module
  **/  
  function resetSorting (){
    cache.columns.map(function (item){
      if(item.sort){
        item.sortingAlgorithm = sorting.transactionIds;
        return item;
      }
      return item;
    });
  }

  /**
  * This method is there to fix problem caused by fetching column from cache
  * When columns are fetched from cache, filtering functionnality does not work
  * this function is there to reset this functionnality
  *
  * @todo This is a lazy solution, we must refactor our cache module or redesign our posting journal module
  **/ 
  function resetFiltering (){
    cache.columns.map(function (item){
      if(item.sort){
        item.sortingAlgorithm = sorting.transactionIds;
        return item;
      }
      return item;
    });
  }

  /** 
  * A facade to call resetSorting and resetFiltering method
  * @return {object} array of columns
  **/

  function resetColumns (){
    resetSorting();
    resetFiltering();
    return cache.columns;
  } 

}
