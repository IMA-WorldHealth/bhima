angular.module('bhima.services')
.service('JournalSortingService', JournalSortingService);

JournalSortingService.$inject = [];

/**
 * Posting Journal Sorting Service 
 *
 * This service is responsible for defining the global configuration for 
 * sorting on the journal UI grid; as well as this the service provides a number 
 * of utility methods used to sort on unique columns
 */
function JournalSortingService() { 
  var service = this;
  
  /** 
   * This method is responsible for sorting transaction IDs that are generally 
   * in the format ALPHA-NUMERIC for example 'TRANS100'. Sorting on a standard
   * string results in 90 being larger than 890 as this is a standard alphabetic
   * sort. This method sorts only the number. 
   * 
   * This sort assumes IDs will be in the format:
   * STRING INTEGER
   *
   * @params {object}   a           The first object
   * @params {object}   b           The second object for comparison
   * @params {object}   rowA        UI Grid row storing all attributes of the first object
   * @params {object}   rowB        UI Grid row storing all attributes of the second object
   * @params {Boolean}  dierection  ASC or DESC
   * @return {Integer}              An integer represeting this elements position relative to others, in 
   *                                this case (compare sort) -1, 0, or 1
   */
  function transactionIds(a, b, rowA, rowB, direction) { 
    
    // Sort on a transactions reference (Human readable ID integer part)
    // this can be updated to respect the string section if required
    var first = Number(rowA.entity.reference);
    var second = Number(rowB.entity.reference);
    
    return first - second;
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
    
    // Gloabl sorting configuration
    gridOptions.enableSorting = true;

    return { 
      transactionIds : transactionIds
    };
  }

  return sortInstance;
}
