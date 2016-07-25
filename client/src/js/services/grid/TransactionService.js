angular.module('bhima.services')
  .service('TransactionService', TransactionService);

TransactionService.$inject = ['util'];

/**
 * Transactions Service
 *
 * This service is responsible for fetching transactions from a datasource
 * and providing a number of utility methods for manipulating and framing this
 * information.
 */
function TransactionService(util) {

  /**
   * @constructor
   */
  function Transactions(gridOptions) {
    this.gridOptions = gridOptions;
    var cachedGridApiCallback = gridOptions.onRegisterApi;

    util.after(gridOptions, 'onRegisterApi', function onRegisterApi(api) {
      this.gridApi = api;
    }.bind(this));
  }

  /**
   * @method validate
   *
   * @description
   * A method to validate individual transactions by their record uuid.  If no records
   * uuids are passed in, it will validate all transactions in the grid.
   */
  Transactions.prototype.validate = function validate() {
    // noop()
  };

  /**
   * @method highlight
   *
   * @description
   * This function sets the _hasHighlight property on all transactions matching
   * the provided uuid.  This should
   */
  Transactions.prototype.highlight = function highlight(uuid, unsetPreviousHighlight) {
    // noop()
  };

  /**
   * @method edit
   *
   * @description
   * This function sets the _editing property on all transactions matching the
   * provided uuid.
   */
  Transactions.prototype.edit = function edit(uuid) {
    // noop()
  };

  /**
   * @method save
   *
   * @description
   * This function unsets the _editing property on all transactions matching the
   * provided uuid.  It validates the transaction before any other action is taken.
   */
  Transactions.prototype.save = function save(uuid) {
    // noop()
  };

  /**
   * @method print
   *
   * @description
   * This function allows the controller to print the selected uuid.
   */
  Transactions.prototype.print = function print(uuid) {
    // noop()
  };

  return Transactions;
}
