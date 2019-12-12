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

  function create(data) {
    return $http.post(baseUrl, data)
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

  function update(id, data) {
    delete data.abbr;
    delete data.enterprise_name;
    delete data.cost_center_name;
    delete data.profit_center_name;

    return $http.put(baseUrl + id, data)
      .then(util.unwrapHttpResponse);
  }

  function del(id) {
    return $http.delete(baseUrl + id)
      .then(util.unwrapHttpResponse);
  }

  return service;
}
