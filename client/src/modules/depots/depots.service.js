angular.module('bhima.services')
  .service('DepotService', DepotService);

DepotService.$inject = ['PrototypeApiService', '$uibModal', 'HttpCacheService'];

/**
 * @class DepotService
 * @extends PrototypeApiService
 *
 * @description
 * Encapsulates common requests to the /depots/ URL.
 */
function DepotService(Api, Modal, HttpCache) {
  const baseUrl = '/depots/';
  const service = new Api(baseUrl);

  // debounce the read() call for depots
  service.read = read;

  const callback = (id, options) => Api.read.call(service, id, options);
  const fetcher = HttpCache(callback, 250);

  /**
   * The read() method loads data from the api endpoint. If an id is provided,
   * the $http promise is resolved with a single JSON object, otherwise an array
   * of objects should be expected.
   *
   * @param {String} uuid - the uuid of the depot to fetch (optional).
   * @param {Object} options - options to be passed as query strings (optional).
   * @param {Boolean} cacheBust - ignore the cache and send the HTTP request directly
   *   to the server.
   * @return {Promise} promise - resolves to either a JSON (if id provided) or
   *   an array of JSONs.
   */
  function read(uuid, options, cacheBust = false) {
    return fetcher(uuid, options, cacheBust);
  }

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
  service.openSelectionModal = function openSelectionModal(depot, isDepotRequired = false) {
    service.isDepotRequired = isDepotRequired;
    return Modal.open({
      controller : 'SelectDepotModalController as $ctrl',
      templateUrl : 'modules/stock/depot-selection.modal.html',
      resolve : { depot : () => depot },
    }).result;
  };

  service.searchByName = function searchByName(options = {}) {
    const target = baseUrl.concat('search/name');
    return service.$http.get(target, { params : options })
      .then(service.util.unwrapHttpResponse);
  };

  service.clean = depot => {
    delete depot.country_name;
    delete depot.province_name;
    delete depot.sector_name;
    delete depot.village_name;
    delete depot.location;
    delete depot.users;
    delete depot.parent;
    delete depot.distribution_depots;
  };

  return service;
}
