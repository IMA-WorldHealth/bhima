angular.module('bhima.services')
.service('TransactionService', TransactionService);

TransactionService.$inject = ['$http', 'store'];

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
function TransactionService($http, Store) { 
  var service = this;

  // @todo update service to use latest posting jounral interface/ API 
  var source = '/journal_list';
  
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

        // @todo Discuss feasability of ES6 
        transactions.map(item => transactionModel.post(item));
      });
  }
  
  // set up service default state - populate with default data
  fetchTransactions();

  // Expose the transactionModel
  service.list = transactionModel;
}
