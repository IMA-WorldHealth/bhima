angular.module('bhima.services')
  .service('GridSortingService', GridSortingService);

GridSortingService.$inject = ['util'];

/**
 * Grid Sorting Service
 *
 * This service is responsible for defining the global configuration for
 * sorting on the UI grids.  This the service provides a number
 * of utility methods used to sort on unique columns.
 */
function GridSortingService(util) {

  /**
   * This method is responsible for sorting transaction IDs that are generally
   * in the format ALPHA-NUMERIC for example 'TRANS100'. Sorting on a standard
   * string results in 90 being larger than 890 as this is a standard alphabetic
   * sort. This method sorts only the number.
   *
   * This sort assumes IDs will be in the format:
   * STRING INTEGER
   *
   * @param {Object}   a           The first object
   * @param {Object}   b           The second object for comparison
   * @param {Object}   rowA        UI Grid row storing all attributes of the first object
   * @param {Object}   rowB        UI Grid row storing all attributes of the second object
   * @param {Boolean}  direction   ASC or DESC
   * @return {Number}              An integer represeting this elements position relative to others, in
   *                               this case (compare sort) -1, 0, or 1
   */
  function transactionIds(a, b, rowA, rowB, direction) {
    var first, second;
    // determine integer (reference) value by extracting it from the transaction ID
    // match returns an array of mathces - take the first element
    first = Number(/[a-z,A-Z]*([0-9]*)/g.exec(a)[1]);
    second = Number(/[a-z,A-Z]*([0-9]*)/g.exec(b)[1]);

    if (first > second) {
      return 1;
    }

    if (first < second) {
      return -1;
    }

    return 0;
  }

  /**
   * This method is used to initialise the sorting service, it receives the
   * gridOptions object from the posting journal to be configured. It then
   * returns an object to expose the methods in the service.
   *
   * @param {Object} gridOptions - Angular UI Grid options object
   * @returns {Function} - Expose all methods from within service
   */
  function GridSorting(gridOptions) {
    // global sorting configuration
    gridOptions.enableSorting = true;

      this.transactionIds = transactionIds;
      this.sortByReference = sortByReference;
    // register for the grid API
    util.after(gridOptions, 'onRegisterApi', function onRegisterApi(api) {
      this.gridApi = api;
    }.bind(this));
  }

  /**
   * @function sortByReferece
   *
   * @description
   * Sorts references as if they were numerical values.
   *
   * @public
   */
  function sortByReference(a, b) {

    // get the last index of the dot in the reference (plus offset)
    var aIdx = a.lastIndexOf('.') + 1,
      bIdx = b.lastIndexOf('.') + 1;

    // get the numerical value
    var aReference = parseInt(a.slice(aIdx)),
      bReference = parseInt(b.slice(bIdx));

    // return the correct numerical value
    return aReference - bReference;
  }

  // bind all algorithms for public consumption
  GridSorting.algorithms = {
    sortByReference : sortByReference
  };

  return GridSorting;
}
