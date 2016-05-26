angular.module('bhima.services')
.service('VoucherService', VoucherService);

VoucherService.$inject = ['PrototypeApiService'];

/**
 * @class VoucherService
 * @extends PrototypeApiService
 *
 * @description
 * This service manages posting data to the database via the /vouchers/ URL.
 *
 * @requires PrototypeApiService
 */
function VoucherService(PrototypeApiService) {
  var service = this;

  // inherit prototype API service methods
  angular.extend(service, PrototypeApiService);

  service.url = '/vouchers/';
  service.createSimple = createSimple;
  service.create = create;

  /**
   * Wraps the prototype create method.
   */
  function create(voucher) {
    return PrototypeApiService.create.call(service, { voucher : voucher });
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

    return PrototypeApiService.call(service, { voucher : clean });
  }

  return service;
}
