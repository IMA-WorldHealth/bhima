angular.module('bhima.services')
  .factory('TransactionTypeService', TransactionTypeService);

TransactionTypeService.$inject = [ 'PrototypeApiService' ];

/**
 * @class Transaction Type
 *
 * @description
 * This service manages crud operation for transaction type
 */
function TransactionTypeService(Api) {
  var service = new Api('/transaction_type/');

  return service;
}
