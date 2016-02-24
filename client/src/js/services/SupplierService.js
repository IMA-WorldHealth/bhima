angular.module('bhima.services')
.service('SupplierService', SupplierService);

SupplierService.$inject = [ '$http', 'util' ];

function SupplierService($http, util) {
  var service = this;

  service.create = create;
  service.read = read;
  service.update = update;
  service.filter = filter; 


  function create(supplier) {
    return $http.post('/suppliers', supplier)
    .then(util.unwrapHttpResponse);
  }

  function read(uuid, params) {
     var url = (uuid) ? '/suppliers/' + uuid : '/suppliers';
     return $http.get(url, { params : params })
     .then(util.unwrapHttpResponse);
  }

  function filter(params) {
    var url = '/suppliers/filter';
    return $http.get(url, { params : params })
      .then(util.unwrapHttpResponse);
  }

  function update(uuid, supplier) {
    return $http.put('/suppliers/' + uuid, supplier)
    .then(util.unwrapHttpResponse);
  }
}





