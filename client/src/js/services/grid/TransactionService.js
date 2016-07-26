angular.module('bhima.services')
.service('TransactionService', TransactionService);

// @todo uuid is currently only used for creating mock transactions - this should
// be removed as soon as this is no longer needed
TransactionService.$inject = ['$http', 'Store', 'uuid'];

/**
 * Transactions Service
 *
 * This service is responsible for fetching transactions from the posting journal
 * and providing a number of utility methods for manipulating and framing this
 * information. Data can be served in one go or using a custom pagination view
 * serving transactions in pages.
 *
 * @todo Discuss as a team how pages would be most logically demonstrated with
 * respect to transactions
 * @todo Update service to use the latest posting journal interface/ API
 */
function TransactionService($http, Store, uuid) {
  var service = this;
  var source = '/journal';

  // model to contain transactions - storing this information in a store
  // allows us to perform gets/puts based on a transactions UUID locally
  var transactionModel = new Store({
    identifier : 'uuid'
  });

  transactionModel.setData([]);

  /**
   * Fetch transactions from the server based on the controllers requirements,
   * updates local transaction model.
   *
   * @todo This method currently just fetches all transactions - factor
   * in pagination logic
   */
  function fetchTransactions() {
    return $http.get(source)
      .then(function (response) {
        var transactions = response.data;

        transactions.map(function (item) { return transactionModel.post(item); });
      });
  }
}
