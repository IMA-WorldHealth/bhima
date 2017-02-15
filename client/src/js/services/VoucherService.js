angular.module('bhima.services')
  .service('VoucherService', VoucherService);

VoucherService.$inject = [
  'PrototypeApiService', '$http', 'util', 'TransactionTypeStoreService'
];

/**
 * @class VoucherService
 * @extends PrototypeApiService
 *
 * @description
 * This service manages posting data to the database via the /vouchers/ URL.  It also
 * includes some utilities that are useful for voucher pages.
 */
function VoucherService(Api, $http, util, TransactionTypeStore) {
  var service = new Api('/vouchers/');

  // @tdoo - remove this reference to baseUrl
  var baseUrl = '/journal/';

  service.create = create;
  service.reverse = reverse;
  service.transactionType = transactionType;

  // returns true if the key starts with an underscore
  function isInternalKey(key) {
    return key[0] === '_' || key[0] === '$';
  }

  // strips internal keys from object
  function stripInternalObjectKeys(object) {

    var o = {};

    angular.forEach(object, function (value, key) {
      if (!isInternalKey(key)) {
        o[key] = value;
      }
    });

    return o;
  }

  /**
   * Wraps the prototype create method.
   */
  function create(voucher) {

    var v = angular.copy(voucher);

    // format items for posting, removing validation keys and unlinking old objects
    v.items = v.items.map(function (item) {
      var escapedItem = stripInternalObjectKeys(item);

      if (escapedItem.entity) {
        escapedItem.entity_uuid = escapedItem.entity.uuid;
      }

      if (escapedItem.reference) {
        escapedItem.reference_uuid = escapedItem.reference.uuid;
      }

      return escapedItem;
    });

    // we pick either the debit or the credit side to assign as the total amount
    // of the voucher
    v.amount = v.items.reduce(function (sum, row) {
      return sum + row.debit;
    }, 0);

    return Api.create.call(service, { voucher : v });
  }

  /**
   * This method facilitate annulling a transaction,
   * bhima should automatically be able to reverse
   * any transaction in the posting_journal by creating a
   * new transaction that is an exact duplicate of the original transaction with the
   * debits and credits switched.
   */
  function reverse(creditNote) {
    return $http.post(baseUrl.concat(creditNote.uuid, '/reverse'), creditNote)
      .then(util.unwrapHttpResponse);
  }

  /**
   * @function transactionType
   * @description return transaction type store object
   * @return {object} Store transaction type store object { data: array, ...}
   */
  function transactionType() {
    return TransactionTypeStore.load();
  }

  return service;
}
