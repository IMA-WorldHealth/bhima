angular.module('bhima.services')
.service('ServiceService', ServiceService);

ServiceService.$inject = [ '$http', 'util' ];

function ServiceService ($http, util) {
  var service = this;
  var baseUrl = '/services/';

  service.create = create;
  service.read = read;
  service.update = update;
  service.delete = del;

  function create(service) {
    return $http.post(baseUrl, service)
    .then(util.unwrapHttpResponse);
  }

  function read(id, params) {
     var url = baseUrl.concat(id || '');
     return $http.get(url, { params : params })
     .then(util.unwrapHttpResponse);
  }

  function update(id, service) {
    delete service.abbr;
    delete service.enterprise_name;
    delete service.cc_id;
    delete service.pc_id;
    delete service.cost_center_name;
    delete service.profit_center_name;

    return $http.put(baseUrl + id, service)
    .then(util.unwrapHttpResponse);
  }

  function del(id) {
    return $http.delete(baseUrl + id)
    .then(util.unwrapHttpResponse);
  }

  return service;
}