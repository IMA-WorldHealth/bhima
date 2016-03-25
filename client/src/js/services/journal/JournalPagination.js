angular.module('bhima.services')
.service('JournalPaginationService', JournalPaginationService);

JournalPaginationService.$inject = [];

/**
 * Posting Journal Pagination Service
 *
 * This service contains pagination configuration and utility methods for the 
 * posting journal module. Custom pagination rules and functions are defined to 
 * ensure that transactions are respected across pages (when grouped).
 *
 * @todo  Discuss if pagination should be encapsulated by TransactionService; this
 *        logic could be incorperation whilst loading transactions however this may result 
 *        in too much responsibility.
 *
 * @todo  Discuss if pagination is required in an accountants workflow - how many 
 *        rows are we expecting etc. 
 */
function JournalPaginationService() { 
  var service = this;
  
  /**
   * this variable configures the grid to use or ignore custom pagination; 
   * true  - external (custom) pagination will be used, transactions are respected 
   *         in page sizes calculated by the `fetchPage` function.
   * false - default (UI Grid) pagination is used, this does not respect transactions
   */
  var useExternalPagination = false;

  // variable used to track and share the current grids API object 
  var gridApi, serviceGridOptions;
  var serviceTransactions;
  
  /** @const */
  var paginationPageSizes = [25, 50, 75, 100];
  var paginationPageSize = 25;

  var paginationOptions = { 
    pageNumber : 1,
    pageSize : paginationPageSize
  };
 
  /** 
   * This method returns a subset of data based 
   * Known shortcomings : 
   * - This method filters out transactions that overflow into the next page; if 
   *   there are transactions bigger than a page it will return nothing
   * - Not all corner cases have been anticipated re: sorting/ filtering/ grouping
   *
   * @params newPage {object}   current page index
   * @params pageSize {object}  page size passed in from gridOptions
   */
  function fetchPage(newPage) { 
    
    // Set the ideal page size to the configured limit - note the size only referers to transaction 
    // elements, not header rows
    var pageSize = paginationOptions.pageSize;

    // Get the current index into the data
    var currentRowIndex = (newPage - 1) * pageSize;
    
    // take an optimistic slice of the current data
    var data = serviceTransactions.slice(currentRowIndex, currentRowIndex + pageSize);
    
    var upperBound = currentRowIndex + pageSize;
    var upperBoundElement = serviceTransactions[upperBound];
    var comparisonElement = serviceTransactions[upperBound + 1];

    if (angular.isDefined(comparisonElement)) { 
      if (upperBoundElement.trans_id === comparisonElement.trans_id) { 

        // filter out this transaction id 
        data = data.filter(row => { return row.trans_id !== upperBoundElement.trans_id });
      }
    }
    
    // update current subset of data
    serviceGridOptions.data = data;

    // update pagination view valuels
    serviceGridOptions.totalItems = serviceTransactions.length;
    serviceGridOptions.paginationPageSize = data.length;
    serviceGridOptions.paginationPageSizes = [data.length]; 
  }

  function paginationInstance(gridOptions, transactions) { 
    var cacheGridApi = gridOptions.onRegisterApi;
     
    serviceGridOptions = gridOptions;
    serviceTransactions = transactions;

    gridOptions.onRegisterApi = function (api) { 
      gridApi = api;
      
      // configure global pagination settings
      gridOptions.paginationPageSizes = paginationPageSizes;
      gridOptions.paginationPageSize = paginationPageSize;
      
      if (useExternalPagination) {  
        gridOptions.useExternalPagination = true;

        // bind external pagination method
        gridApi.pagination.on.paginationChanged(null, fetchPage);
      
        // Settup initial page
        fetchPage(paginationOptions.pageNumber);
      }

      // call the method that had previously been registered to request the grids api
      if (angular.isDefined(cacheGridApi)) { 
        cacheGridApi(api);
      }
    };
  }
  return paginationInstance;
}
