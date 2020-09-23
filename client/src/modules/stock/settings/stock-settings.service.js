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

  function create(settings) {
    return $http.post(baseUrl, { settings })
      .then(util.unwrapHttpResponse);
  }

  function update(id, settings) {
    delete settings.id;

    return $http.put(baseUrl.concat(id), settings)
      .then(util.unwrapHttpResponse);
  }

  return service;
}
