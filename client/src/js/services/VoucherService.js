angular.module('bhima.services')
.service('VoucherService', VoucherService);

VoucherService.$inject = [ '$http', 'util' ];

function VoucherService ($http, util) {
  var service = this;
  var baseUrl = '/vouchers/';

  service.create = create;
  service.read = read;

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

  return service;
}