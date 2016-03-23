angular.module('bhima.services')
.service('VoucherService', VoucherService);

VoucherService.$inject = [ '$http', 'util' ];

function VoucherService ($http, util) {
  var service = this;
  var baseUrl = '/vouchers/';

  service.create = create;
  service.read = read;
  service.createSimple = createSimple;

  /** send an http request to create a voucher**/
  function create(voucher) {
    return $http.post(baseUrl, voucher)
    .then(util.unwrapHttpResponse);
  }

  /**send a http request to read a voucher **/
  function read(id) {
     var url = baseUrl.concat(id || '');
     return $http.get(url)
     .then(util.unwrapHttpResponse);
  }

  /**
   * Creates a simple journal voucher, transforming the object into double-entry
   * accounting
   * @method createSimple
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

    return $http.post(baseUrl, { voucher : clean })
    .then(util.unwrapHttpResponse);
  }

  return service;
}
