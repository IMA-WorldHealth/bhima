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
 * information. Data can be served in one go or using a custom pagincation view
 * serving transactions in pages.
 *
 * @todo Discuss as a team how pages would be most logically demonstrated with
 * respect to transactions
 * @todo Service is designed to be called once per page - this use case should
 * be discussed
 * @todo Update service to use the latest posting journal interface/ API
 */
function TransactionService($http, Store, uuid) {
  var service = this;

  // @todo update service to use latest posting jounral interface/ API
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
    $http.get(source)
      .then(function (response) {
        var transactions = response.data;

        transactions.map(function (item) { return transactionModel.post(item); });
      });
  }

  /** DEVELOPMENT UTILITIES --------------------------------------------------*/

  /**
   * Mock transactions that would normally be returned from the server, this method
   * is primarily designed to help test core journal features before all  of the
   * additional core finance pieces are completed. It will be depricated as soon
   * as 2.x is feature complete.
   */
  function mockTransactions() {

    // configure mock configuration
    var numberOfTransactions = 100;
    var transactionPrefix = 'TRANS';
    var descriptionPrefix = 'Mock transaction for ID: ';
    var currencyId = 1;
    var accounts = [100, 101, 102, 200, 202, 203, 400, 500, 600];

    var transactions = [];

    // each iteration will create a new transaction, a transaction can contain any
    // number of rows
    for (var i = 0; i < numberOfTransactions; i++) {
      var currentTransaction = buildMockTransaction(i);
      transactions = transactions.concat(currentTransaction);
    }

    function buildMockTransaction(id) {
      var transaction;
      var upperLines = 10;
      var upperCost = 10000;
      var numberOfLines = Math.round(Math.random() * upperLines);
      var cost = selectEvenNumber(upperCost);
      var date = selectDate();
      var transactionId = transactionPrefix.concat(id);

      // array of (n) undefined elements
      transaction = Array.apply(null, { length : numberOfLines });

      return transaction.map(function (row) {

        return {
          uuid : uuid(),
          trans_id : transactionId,
          trans_date : date,
          description : descriptionPrefix.concat(transactionId),
          reference : id,
          currency_id : currencyId,
          account_number : selectAccount(),
          account : selectEvenNumber,

          // @todo to verify aggregation these values will have to sum according
          // to double entry accounting (balance)
          debit_equiv : selectEvenNumber(cost),
          credit_equiv : selectEvenNumber(cost),
        };
      });
    }

    function selectDate() {
      var start = new Date(2014, 0, 1);
      var end = new Date();

      return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    }

    function selectEvenNumber(max) {
      var number = (Math.random() * max);
      return number - number % 2;
    }

    function selectAccount() {
      return accounts[Math.round(Math.random() * (accounts.length - 1))];
    }

    transactions.map(function (item) { return transactionModel.post(item); });
  }

  // set up service default state - populate with default data
  mockTransactions();

  // Expose the transactionModel
  service.list = transactionModel;
}
