angular.module('bhima.services')
.service('JournalSortingService', JournalSortingService);

JournalSortingService.$inject = [];

/**
 * Posting Journal Sorting Service 
 *
 * This service is responsible for defining the global configuration for 
 * sorting on the journal UI grid; as well as this the service provides a number 
 * of utility methods used to sort on unique columns
 *
 * @todo Discuss if this service must be able to be used multiple time simultenously 
 * in one application runtime; if this is the case the grid api must be encapsulated by sortInstance
 */
function JournalSortingService() { 
  var service = this; 
  
  // Variable used to track and share the current grids API object
  var gridApi;

  /** 
   * This method is responsible for sorting transaction IDs that are generally 
   * in the format ALPHA-NUMERIC for example 'TRANS100'. Sorting on a standard
   * string results in 90 being larger than 890 as this is a standard alphabetic
   * sort. This method sorts only the number. 
   * 
   * This sort assumes IDs will be in the format:
   * STRING INTEGER
   *
   * @param {object}   a           The first object
   * @param {object}   b           The second object for comparison
   * @param {object}   rowA        UI Grid row storing all attributes of the first object
   * @param {object}   rowB        UI Grid row storing all attributes of the second object
   * @param {Boolean}  dierection  ASC or DESC
   * @return {Integer}              An integer represeting this elements position relative to others, in 
   *                                this case (compare sort) -1, 0, or 1
   */
  function transactionIds(a, b, rowA, rowB, direction) { 
    var first, second;
    var nullValuesResult = gridApi.core.sortHandleNulls(a, b);
      
    // if there is no row information we must assume this is a group and we only 
    // have the transaction ID to inform the sort
    var isGroupRowHeader = angular.isUndefined(rowA);

    // allow UI Grid to sort null values appropriately
    if (nullValuesResult !== null) { 
      return nullValuesResult;
    }
  
    // determine values for comparison
    if (isGroupRowHeader) { 
      var testInteger = /\d+$/;

      // determine integer (reference) value by extracting it from the transaction ID
      // match returns an array of mathces - take the first element
      first = Number(a.match(testInteger).shift());
      second = Number(b.match(testInteger).shift());
    } else { 
      
      // reference value is passed in the row - simply use this
      first = Number(rowA.entity.reference);
      second = Number(rowB.entity.reference);
    }
  
    // This (standard method) casuses transaction groups to be sorted incorrectly - why has not been demonstrated
    // Standard integer compare sort: retrun first - second;
    if (first > second) { 
      return 1; 
    } 

    if (first < second) { 
      return -1;
    }
    return 0;
  }

  /**
   * This method is used to initialise the sorting service, it recieves the 
   * gridOptions object from the posting journal to be configured. It then returns 
   * an object to expose the methods in the service. 
   *
   * @param {object} gridOptions Angular UI Grid options object 
   * @returns {object} Expose all methods from within service
   */
  function sortInstance(gridOptions) { 
    var cacheGridApi = gridOptions.onRegisterApi;
   
    // Gloabl sorting configuration
    gridOptions.enableSorting = true;

    // Register for the Grid API
    gridOptions.onRegisterApi = function (api) { 
      gridApi = api;
  
      // Call the method that had previously been registered to request the grids api
      if (angular.isDefined(cacheGridApi)) { 
        cacheGridApi(api);
      }
    };

    // Expose service API
    return { 
      transactionIds : transactionIds
    };
  }

  return sortInstance;
}
