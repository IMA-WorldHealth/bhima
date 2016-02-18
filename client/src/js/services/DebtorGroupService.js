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

  /** Exposed method read */
  service.read = read;

  /**
  * @method read
  * @param {string} uuid The debtor group uuid
  * @param {object} parameters The query string object
  * @description This function is responsible for getting debtor groups
  */
  function read(uuid, parameters) {
    var url = uuid ? '/debtor_groups/' + uuid : '/debtor_groups/';
    return $http.get(url, { params : parameters })
    .then(util.unwrapHttpResponse);
  }
}
