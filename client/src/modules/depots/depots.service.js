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
  const baseUrl = '/depots/';
  const service = new Api(baseUrl);

  /**
   * @method openSelectionModal
   *
   * @description
   * Opens the selection modal to allow a user to select a depot.
   *
   * @returns Promise - a promise containing the selected depot.
   *
   * @param isDepotRequired helps to keep the modal displayed as long as no depot was submitted
   */
  service.openSelectionModal = function openSelectionModal(depot, isDepotRequired) {
    service.isDepotRequired = isDepotRequired || false;
    return Modal.open({
      controller : 'SelectDepotModalController as $ctrl',
      templateUrl : 'modules/stock/depot-selection.modal.html',
      resolve : {
        depot : function injectDepot() { return depot; },
      },
      backdrop : 'static',
      keyboard : false,
    }).result;
  };

  service.searchByName = function searchByName(options) {
    const opts = angular.copy(options || {});

    const target = baseUrl.concat('search/name');

    return service.$http.get(target, { params : opts })
      .then(service.util.unwrapHttpResponse);
  };

  service.clean = depot => {
    delete depot.country_name;
    delete depot.province_name;
    delete depot.sector_name;
    delete depot.village_name;
    delete depot.location;
  };

  return service;
}
