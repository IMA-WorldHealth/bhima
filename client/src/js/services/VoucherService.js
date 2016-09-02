angular.module('bhima.services')
  .service('VoucherService', VoucherService);

VoucherService.$inject = [
  'PrototypeApiService', '$http', 'util'
];

/**
 * @class VoucherService
 * @extends PrototypeApiService
 *
 * @description
 * This service manages posting data to the database via the /vouchers/ URL.
 * @todo: Think about to move transferType into the database table
 */
function VoucherService(Api, $http, util) {
  var service = new Api('/vouchers/');

  // @tdoo - remove this reference to baseUrl
  var baseUrl = '/journal/';

  /**
   * transfer type
   * @deprecated use transactionType in place...
   * @todo remove securely this array i.e. be sure that no module use this element
   */
  service.transferType = [
    { id: 0, text: 'VOUCHERS.SIMPLE.GENERIC_INCOME', incomeExpense: 'income', prefix: 'REC. GEN' },
    { id: 1, text: 'VOUCHERS.SIMPLE.CASH_PAYMENT', incomeExpense: 'income', prefix: 'CASH' },
    { id: 2, text: 'VOUCHERS.SIMPLE.CONVENTION_PAYMENT', incomeExpense: 'income', prefix: 'CONV' },
    { id: 3, text: 'VOUCHERS.SIMPLE.SUPPORT_INCOME', incomeExpense: 'income', prefix: 'PEC' },
    { id: 4, text: 'VOUCHERS.SIMPLE.TRANSFER', incomeExpense: 'income', prefix: 'TRANSF' },
    { id: 5, text: 'VOUCHERS.SIMPLE.GENERIC_EXPENSE', incomeExpense: 'expense', prefix: 'DEP. GEN' },
    { id: 6, text: 'VOUCHERS.SIMPLE.SALARY_PAYMENT', incomeExpense: 'expense', prefix: 'SALAIRE' },
    { id: 7, text: 'VOUCHERS.SIMPLE.CASH_RETURN', incomeExpense: 'expense', prefix: 'PAYBACK' },
    { id: 8, text: 'VOUCHERS.SIMPLE.PURCHASES', incomeExpense: 'expense', prefix: 'ACHAT' },
    { id: 9, text: 'VOUCHERS.SIMPLE.CREDIT_NOTE', incomeExpense: 'creditNote', prefix: 'CREDIT NOTE' },
  ];

  service.createSimple = createSimple;
  service.create = create;
  service.reverse = reverse;
  service.getTransferType = getTransferType;
  service.getTransferText = getTransferText;
  service.transactionType = transactionType;

  /** Get transfer type */
  function getTransferType(id) {
    return service.transferType.filter(function (item) {
      return item.id === id;
    })[0];
  }

  /** Get transfer type text */
  function getTransferText(id) {
    var result = getTransferType(id);
    return result ? result.text : id;
  }

  /**
   * Wraps the prototype create method.
   */
  function create(voucher) {
    return Api.create.call(service, { voucher : voucher });
  }

  /**
   * @method createSimple
   *
   * @description
   * Creates a simple journal voucher, transforming the object into double-entry
   * accounting.
   *
   * @param {object} voucher - the raw journal voucher
   * @returns {Promise} - the $http promise object
   */
  function createSimple(voucher) {

    // create a local working copy for manipulation
    var clean = angular.copy(voucher);

    // in a simple journal voucher, there are two items
    var items = [{
      debit : clean.amount,
      credit: 0,
      account_id : clean.fromAccount.id
    }, {
      debit : 0,
      credit : clean.amount,
      account_id : clean.toAccount.id
    }];

    // clean up the voucher by removing view properties
    delete clean.toAccount;
    delete clean.fromAccount;

    // bind the voucher items
    clean.items = items;

    return Api.create.call(service, { voucher : clean });
  }

  /**
   * This method facilitate annulling a transaction,
   * bhima should automatically be able to reverse
   * any transaction in the posting_journal by creating a
   * new transaction that is an exact duplicate of the original transaction with sign minous.
   */
  function reverse(creditNote) {
    return $http.post(baseUrl.concat(creditNote.uuid, '/reverse'), creditNote)
      .then(util.unwrapHttpResponse);
  }

  /**
   * This function returns transaction type from the db
   */
  function transactionType() {
    return $http.get('/transaction_type')
      .then(util.unwrapHttpResponse);
  }

  return service;
}
