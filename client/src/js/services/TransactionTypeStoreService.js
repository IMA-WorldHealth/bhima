angular.module('bhima.services')
.service('TransactionTypeStoreService', TransactionTypeStoreService);

// dependencies injection
TransactionTypeStoreService.$inject = ['$q', 'TransactionTypeService', 'Store'];

/**
 * Transaction Type Store Controller
 */
function TransactionTypeStoreService($q, TransactionType, Store) {
  var service = this;
  var data = new Store();
  var initialLoad = true;

  var request = TransactionType.read()
    .then(function (result) {
      data.setData(result);
      initialLoad = false;
      return data;
    });

  service.load = transactionTypeStore;
  service.refresh = refresh;

  function refresh() {
    TransactionType.read()
    .then(function (result) {
      data.setData(result);
    });
  }

  function transactionTypeStore() {
    return initialLoad ? request : $q.resolve(data);
  }

}
