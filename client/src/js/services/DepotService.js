angular.module('bhima.services')
.service('DepotService', DepotService);

DepotService.$inject = ['PrototypeApiService'];

/**
 * @class DepotService
 * @extends PrototypeApiService
 *
 * @description
 * Encapsulates common requests to the /depots/ URL.
 */
function DepotService(Api) {
  var service = new Api('/depots/');
  return service;
}
