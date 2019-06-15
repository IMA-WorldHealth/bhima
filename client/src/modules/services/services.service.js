angular.module('bhima.services')
  .service('ServiceService', ServiceService);

ServiceService.$inject = ['$http', 'util'];

function ServiceService($http, util) {
  const service = this;
  const baseUrl = '/services/';

  service.create = create;
  service.read = read;
  service.update = update;
  service.delete = del;
  service.count = count;

  function create(_service_) {
    return $http.post(baseUrl, _service_)
      .then(util.unwrapHttpResponse);
  }

  function read(id, params) {
    const url = baseUrl.concat(id || '');
    return $http.get(url, { params })
      .then(util.unwrapHttpResponse);
  }

  function count() {
    const url = baseUrl.concat('count');
    return $http.get(url)
      .then(util.unwrapHttpResponse);
  }

  function update(id, _service_) {
    delete _service_.abbr;
    delete _service_.enterprise_name;
    delete _service_.cc_id;
    delete _service_.pc_id;
    delete _service_.cost_center_name;
    delete _service_.profit_center_name;

    return $http.put(baseUrl + id, _service_)
      .then(util.unwrapHttpResponse);
  }

  function del(id) {
    return $http.delete(baseUrl + id)
      .then(util.unwrapHttpResponse);
  }

  return service;
}
