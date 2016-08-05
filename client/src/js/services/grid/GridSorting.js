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
    var nullValuesResult = this.gridApi.core.sortHandleNulls(a, b);

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

    // register for the grid API
    util.after(gridOptions, 'onRegisterApi', function onRegisterApi(api) {
      this.gridApi = api;
      this.transactionIds = transactionIds.bind(this);
    }.bind(this));
  }

  return GridSorting;
}
