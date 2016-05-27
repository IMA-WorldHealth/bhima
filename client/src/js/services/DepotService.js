angular.module('bhima.services')
.service('DepotService', DepotService);

DepotService.$inject = ['PrototypeApiService'];

/**
 * @class DepotService
 * @extends PrototypeApiService
 *
 * @description
 * Encapsulates common requests to the /depots/ URL.
 *
 * @requires PrototypeApiService
 */
function DepotService(PrototypeApiService) {
  var service = this;

  // inherit from PrototypeApiService
  angular.extend(service, PrototypeApiService);

  // the url target
  service.url = '/depots/';
}
