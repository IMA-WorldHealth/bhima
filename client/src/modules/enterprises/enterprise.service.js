angular.module('bhima.services')
  .factory('EnterpriseService', EnterpriseService);

EnterpriseService.$inject = ['$http', 'util'];

function EnterpriseService($http, util) {
  const service = {};
  const baseUrl = '/enterprises/';

  service.read = read;
  service.create = create;
  service.update = update;

  function read(id, options) {
    const url = baseUrl.concat(id || '');
    return $http.get(url, { params : options })
      .then(util.unwrapHttpResponse);
  }

  function create(enterprise) {
    return $http.post(baseUrl, { enterprise })
      .then(util.unwrapHttpResponse);
  }

  function update(id, enterprise) {
    delete enterprise.id;

    return $http.put(baseUrl.concat(id), enterprise)
      .then(util.unwrapHttpResponse);
  }

  return service;
}
