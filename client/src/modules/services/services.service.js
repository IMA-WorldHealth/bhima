angular.module('bhima.services')
.service('ServiceService', ServiceService);

ServiceService.$inject = ['$http', 'util'];

function ServiceService($http, util) {
  var service = this;
  var baseUrl = '/services/';

  service.create = create;
  service.read = read;
  service.update = update;
  service.delete = del;

  function create(serviceObject) {
    return $http.post(baseUrl, serviceObject)
    .then(util.unwrapHttpResponse);
  }

  function read(id, parameters) {
    var url = baseUrl.concat(id || '');
    return $http.get(url, { params : parameters })
     .then(util.unwrapHttpResponse);
  }

  function update(id, serviceObject) {
    delete serviceObject.abbr;
    delete serviceObject.enterprise_name;
    delete serviceObject.cc_id;
    delete serviceObject.pc_id;
    delete serviceObject.cost_center_name;
    delete serviceObject.profit_center_name;

    return $http.put(baseUrl + id, serviceObject)
    .then(util.unwrapHttpResponse);
  }

  function del(id) {
    return $http.delete(baseUrl + id)
    .then(util.unwrapHttpResponse);
  }

  return service;
}
