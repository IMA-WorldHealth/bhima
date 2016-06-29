angular.module('bhima.services')
.service('SupplierService', SupplierService);

SupplierService.$inject = [ 'PrototypeApiService' ];

function SupplierService(Api) {
  var service = new Api('/suppliers/');
  return service;
}
