angular.module('bhima.services')
  .service('TransactionTypeService', TransactionTypeService);

TransactionTypeService.$inject = ['PrototypeApiService'];

/**
 * @class Transaction Type
 *
 * @description
 * This service manages CRUD operations on transaction types.
 */
function TransactionTypeService(Api) {
  return new Api('/transaction_type/');
}
