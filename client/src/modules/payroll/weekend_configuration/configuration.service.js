angular.module('bhima.services')
  .service('ConfigurationWeekEndService', ConfigurationWeekEndService);

ConfigurationWeekEndService.$inject = ['PrototypeApiService', '$uibModal', '$http', 'util'];

/**
 * @class ConfigurationWeekEndService
 * @extends PrototypeApiService
 *
 * @description
 * Encapsulates common requests to the /weekend_config/ URL.
 */
function ConfigurationWeekEndService(Api, Modal, $http, util) {
  var service = new Api('/weekend_config/');

  service.getWeekDays = getWeekDays;
  service.setWeekDays = setWeekDays;

  // loads the configuration's week days
  function getWeekDays(id) {
    return $http.get(`/weekend_config/${id}/days`)
      .then(util.unwrapHttpResponse);
  }

  // Sets Payroll Weekdays' Configuration using the public API
  function setWeekDays(id, data) {
    return $http.post(`/weekend_config/${id}/days`, { configuration : data })
      .then(util.unwrapHttpResponse);
  }

  return service;
}