angular.module('bhima.services')
  .factory('StockSettingsService', StockSettingsService);

StockSettingsService.$inject = ['$http', 'util'];

function StockSettingsService($http, util) {
  const service = {};
  const baseUrl = '/stock/setting/';

  service.read = read;
  service.create = create;
  service.update = update;

  function read(id, options) {
    const url = baseUrl.concat(id || '');
    return $http.get(url, { params : options })
      .then(util.unwrapHttpResponse);
  }

  function create(enterprise_id) {
    return $http.post(baseUrl, { 'enterprise_id' : enterprise_id })
      .then(util.unwrapHttpResponse);
  }

  function update(id, settings) {
    return $http.put(baseUrl.concat(id), settings)
      .then(util.unwrapHttpResponse);
  }

  return service;
}
