angular.module('bhima.services')
  .service('LocationService', LocationService);

LocationService.$inject = ['PrototypeApiService', 'util', '$uibModal'];

/**
 * @class Location Service
 * @extends PrototypeApiService
 *
 * @description
 * Encapsulates common requests to the /grades/ URL.
 */
function LocationService(Api, util, Modal) {
  const service = new Api('/locations/');

  service.create.type = createType;
  service.update.type = updateType;
  service.delete.type = removeType;

  service.merge = merge;
  service.types = types;
  service.loadLocationsRoot = loadLocationsRoot;

  /** detail interfacs */
  service.location = location;
  service.locations = locations;

  /** launch the "add location" modal */
  service.modal = modal;

  const baseUrl = '/locations';

  /**
   * wrapper for HTTP requests made to the baseUrl endpoint
   * @private
   */
  function request(path, options) {
    return service.$http.get(baseUrl.concat(path), options)
      .then(util.unwrapHttpResponse);
  }

  /**
   * @method merge
   *
   * @description
   * This method merge two locations into a one
   *
   * @param {object} params { selected: String, other: Array }
   */
  function merge(params) {
    const path = `/locations/merge`;
    return service.$http.post(path, params)
      .then(util.unwrapHttpResponse);
  }

  /**
   * fetch a list of types locations from the server
   * @public
   */
  function types(options) {
    return request('/types', { params : options });
  }

  function createType(data) {
    return createGeneric('/types', data);
  }

  function removeType(id) {
    return service.$http.delete(`/locations/types/${id}`)
      .then(util.unwrapHttpResponse);
  }

  function updateType(id, type) {
    return service.$http.put('/locations/types/'.concat(id), type)
      .then(util.unwrapHttpResponse);
  }

  /**
   * fetch a list of types locations from the server
   * @public
   */
  function loadLocationsRoot(options) {
    return request('/root', { params : options });
  }

  /**
   * fetch All locations by type for a particular location
   * uuid from the database.
   *
   * @param {String} a village uuid to look up
   * @public
   */
  function location(uuid) {
    return request('/detail/'.concat(uuid));
  }

  /**
   * fetch a list of all data about locations from the server
   * @public
   */
  function locations(options) {
    return request('/detail', { params : options });
  }

  /**
   * Opens the "Add a Location" modal in place
   */
  function modal() {
    return Modal.open({
      templateUrl : 'modules/templates/modals/location.modal.html',
      controller : 'LocationModalController as LocationModalCtrl',
      size : 'md',
    }).result;
  }

  /**
   * generic interface for creation methods
   * @private
   */
  function createGeneric(endpoint, data) {
    return service.$http.post(baseUrl.concat(endpoint), data)
      .then(util.unwrapHttpResponse);
  }

  return service;
}
