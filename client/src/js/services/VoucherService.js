angular.module('bhima.services')
.service('VoucherService', VoucherService);

VoucherService.$inject = ['PrototypeApiService'];

/**
 * @class VoucherService
 * @extends PrototypeApiService
 *
 * @description
 * This service manages posting data to the database via the /vouchers/ URL.
 */
function VoucherService(Api) {
  var service = new Api('/vouchers/');

  // transfer type
  service.transferType = [
    { id: 0, text: 'VOUCHERS.SIMPLE.GENERIC_INCOME', incomeExpense: 'income', prefix: 'REC. GEN' },
    { id: 1, text: 'VOUCHERS.SIMPLE.CASH_PAYMENT', incomeExpense: 'income', prefix: 'CASH' },
    { id: 2, text: 'VOUCHERS.SIMPLE.CONVENTION_PAYMENT', incomeExpense: 'income', prefix: 'CONV' },
    { id: 3, text: 'VOUCHERS.SIMPLE.SUPPORT_INCOME', incomeExpense: 'income', prefix: 'PEC' },
    { id: 4, text: 'VOUCHERS.SIMPLE.TRANSFER', incomeExpense: 'income', prefix: 'TRANSF' },
    { id: 5, text: 'VOUCHERS.SIMPLE.GENERIC_EXPENSE', incomeExpense: 'expense', prefix: 'DEP. GEN' },
    { id: 6, text: 'VOUCHERS.SIMPLE.SALARY_PAYMENT', incomeExpense: 'expense', prefix: 'SALAIRE' },
    { id: 7, text: 'VOUCHERS.SIMPLE.CASH_RETURN', incomeExpense: 'expense', prefix: 'PAYBACK' },
    { id: 8, text: 'VOUCHERS.SIMPLE.PURCHASES', incomeExpense: 'expense', prefix: 'ACHAT' }
  ];

  service.url = '/vouchers/';
  service.createSimple = createSimple;
  service.create = create;

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

  return service;
}
