angular.module('bhima.services')
.service('CreditorGroupService', CreditorGroupService);

CreditorGroupService.$inject = ['$http', 'util'];

/**
* Creditor Group Service
*
* This service implements CRUD operations for the /creditor_groups API endpoint
*/
function CreditorGroupService($http, util) {
  var service = this;
  var baseUrl = '/creditor_groups/';

  /** Exposed method read */
  service.read = read;

  /**
  * @method read
  * @param {string} uuid The creditor group uuid
  * @param {object} parameters The query string object
  * @description This function is responsible for getting creditor groups
  */
  function read(uuid, parameters) {
    var url = baseUrl.concat(uuid || '');
    return $http.get(url, { params : parameters })
    .then(util.unwrapHttpResponse);
  }

  return service;
}
