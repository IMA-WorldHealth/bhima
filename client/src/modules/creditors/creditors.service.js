angular.module('bhima.services')
.service('CreditorService', CreditorService);

CreditorService.$inject = ['$http', 'util'];

/**
* Creditor Service
*
* This service implements CRUD operations for the /creditors API endpoint
*/
function CreditorService($http, util) {
  var service = this;
  var baseUrl = '/creditors/';

  /** Exposed method read */
  service.read = read;

  /**
  * @method read
  * @param {string} uuid The creditor uuid
  * @param {object} parameters The query string object
  * @description This function is responsible for getting creditors
  */
  function read(uuid, parameters) {
    var url = baseUrl.concat(uuid || '');
    return $http.get(url, { params : parameters })
    .then(util.unwrapHttpResponse);
  }

  return service;
}
