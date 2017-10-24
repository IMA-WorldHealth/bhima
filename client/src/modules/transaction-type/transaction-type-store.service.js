angular.module('bhima.services')
  .service('TransactionTypeStoreService', TransactionTypeStoreService);

TransactionTypeStoreService.$inject = ['$q', 'TransactionTypeService', 'Store'];

/**
 * Transaction Type Store Controller
 */
function TransactionTypeStoreService($q, TransactionType, Store) {
  var service = this;
  var data = new Store();
  var initialLoad = true;

  service.load = transactionTypeStore;
  service.refresh = refresh;

  function refresh() {
    TransactionType.read()
      .then(function (result) {
        data.setData(result);
      });
  }

  function transactionTypeStore() {
    var request = TransactionType.read()
      .then(function (result) {
        data.setData(result);
        initialLoad = false;
        return data;
      });

    return initialLoad ? request : $q.resolve(data);
  }
}
