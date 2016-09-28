angular.module('bhima.services')
  .service('CreditorGroupService', CreditorGroupService);

CreditorGroupService.$inject = ['PrototypeApiService'];

/**
* Creditor Group Service
*
* This service implements CRUD operations for the /creditor_groups API endpoint
*/
function CreditorGroupService(Api) {
  var service = Api('/creditor_groups/');
  return service;
}
