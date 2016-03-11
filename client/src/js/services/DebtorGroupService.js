angular.module('bhima.services')
.service('DebtorGroupService', DebtorGroupService);

DebtorGroupService.$inject = ['$http', 'util'];

/**
* Debtor Group Service
*
* This service implements CRUD operations for the /debtor_groups API endpoint
*/
function DebtorGroupService($http, util) {
  var service = this;
  var baseUrl = '/debtor_groups/';

  /** Exposed method read */
  service.read = read;
  service.create = create;
  service.update = update;

  /**
  * @method read
  * @param {string} uuid The debtor group uuid
  * @param {object} parameters The query string object
  * @description This function is responsible for getting debtor groups
  */
  function read(uuid, parameters) {
    var url = baseUrl.concat(uuid || '');
    return $http.get(url, { params : parameters })
    .then(util.unwrapHttpResponse);
  }

  /**
  * @method create
  * @param {object} debtorGroup The debtor group object
  * @description This function is responsible for create new debtor group
  */
  function create(debtorGroup) {
    return $http.post(baseUrl, debtorGroup)
    .then(util.unwrapHttpResponse);
  }

  /**
  * @method update
  * @param {string} uuid The debtor group uuid
  * @param {object} debtorGroup The debtor group object
  * @description This function is responsible for updating a debtor group
  */
  function update(uuid, debtorGroup) {
    var url = baseUrl.concat(uuid);
    return $http.put(url, debtorGroup)
    .then(util.unwrapHttpResponse);
  }

  return service;
}
