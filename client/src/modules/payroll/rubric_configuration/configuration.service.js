angular.module('bhima.services')
  .service('ConfigurationService', ConfigurationService);

ConfigurationService.$inject = ['PrototypeApiService', '$uibModal', '$http', 'util'];

/**
 * @class RubricService
 * @extends PrototypeApiService
 *
 * @description
 * Encapsulates common requests to the /rubric_config/ URL.
 */
function ConfigurationService(Api, Modal, $http, util) {
  var service = new Api('/rubric_config/');

  service.getRubrics = getRubrics;
  service.setRubrics = setRubrics;

  // loads the configuration's rubrics
  function getRubrics(id) {
    return $http.get(`/rubric_config/${id}/setting`)
      .then(util.unwrapHttpResponse);
  }

  // Sets Payroll Rubric's Configuration using the public API
  function setRubrics(id, data) {
    return $http.post(`/rubric_config/${id}/setting`, { configuration : data })
      .then(util.unwrapHttpResponse);
  }

  return service;
}
