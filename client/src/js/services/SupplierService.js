angular.module('bhima.services')
.service('SupplierService', SupplierService);

SupplierService.$inject = [ '$http', 'util' ];

function SupplierService($http, util) {
  var service = this;

  service.create = create;
  service.read = read;
  service.update = update;
  service.search = search;

  function create(supplier) {
    return $http.post('/suppliers', supplier)
    .then(util.unwrapHttpResponse);
  }

  function read(uuid, params) {
     var url = '/suppliers/'.concat(uuid || '');
     return $http.get(url, { params : params })
     .then(util.unwrapHttpResponse);
  }

  function search(params) {
    var url = '/suppliers/search';
    params.limit = params.limit || 20;

    return $http.get(url, { params : params })
      .then(util.unwrapHttpResponse);
  }

  function update(uuid, supplier) {
    return $http.put('/suppliers/' + uuid, supplier)
    .then(util.unwrapHttpResponse);
  }

  return service;
}
