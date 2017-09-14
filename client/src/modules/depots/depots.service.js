angular.module('bhima.services')
  .service('DepotService', DepotService);

DepotService.$inject = ['PrototypeApiService', '$uibModal'];

/**
 * @class DepotService
 * @extends PrototypeApiService
 *
 * @description
 * Encapsulates common requests to the /depots/ URL.
 */
function DepotService(Api, Modal) {
  var service = new Api('/depots/');

  /**
   * @method openSelectionModal
   *
   * @description
   * Opens the selection modal to allow a user to select a depot.
   *
   * @returns Promise - a promise containing the depot.
   */
  service.openSelectionModal = function openSelectionModal(depot) {
    return Modal.open({
      controller : 'SelectDepotModalController as $ctrl',
      templateUrl : 'modules/stock/depot-selection.modal.html',
      resolve : {
        depot: function injectDepot() { return depot; },
      },
      backdrop : 'static',
      keyboard : false,
    }).result;
  };

  return service;
}
