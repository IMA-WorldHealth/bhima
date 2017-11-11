angular.module('bhima.services')
  .service('TransactionService', TransactionService);

TransactionService.$inject = ['$http', 'util'];

function TransactionService($http, util) {
  var service = this;
  var baseUrl = '/transactions/';

  service.remove = remove;
  service.comment = comment;
  service.history = historyFn;

  /**
   * @method remove
   *
   * @description
   * This function removes a transaction from the database via the transaction
   * delete route.  It also removes the corresponding invoice/voucher/cash
   * payment as necessary.
   */
  function remove(uuid) {
    var url = baseUrl.concat(uuid);
    return $http.delete(url)
      .then(util.unwrapHttpResponse);
  }


  function comment(params) {
    var url = baseUrl.concat('comments');
    return $http.put(url, { params : params })
      .then(util.unwrapHttpResponse);
  }

  /**
   * @method history
   *
   * @description
   * This function loads the history of a given transaction from the database.
   */
  function historyFn(uuid) {
    var url = baseUrl.concat(uuid, '/history');
    return $http.get(url)
      .then(util.unwrapHttpResponse);
  }

  return service;
}
