angular.module('bhima.services')
  .factory('PayrollSettingsService', PayrollSettingsService);

PayrollSettingsService.$inject = ['$http', 'util'];

function PayrollSettingsService($http, util) {
  const service = {};
  const baseUrl = '/payroll/setting/';

  service.read = read;
  service.create = create;
  service.update = update;

  function read(id, options) {
    const url = baseUrl.concat(id || '');
    return $http.get(url, { params : options })
      .then(util.unwrapHttpResponse);
  }

  function create(enterpriseId) {
    return $http.post(baseUrl, { enterprise_id : enterpriseId })
      .then(util.unwrapHttpResponse);
  }

  function update(id, settings) {
    return $http.put(baseUrl.concat(id), settings)
      .then(util.unwrapHttpResponse);
  }

  return service;
}
