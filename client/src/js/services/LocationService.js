angular.module('bhima.services')
.service('LocationService', LocationService);

LocationService.$inject = [ '$http', 'util' ];

/**
 * Location Service
 *
 * Interacts with the /locations API.
 */
function LocationService($http, util) {
  var service = {};
  var baseUrl = '/locations';

  service.villages = villages;
  service.provinces = provinces;
  service.sectors = sectors;
  service.countries = countries;
  service.location = location;

  /**
   * wrapper for HTTP requests made to the baseUrl endpoint
   * @private
   */
  function request(path) {
    return $http.get(baseUrl.concat(path))
    .then(util.unwrapHttpResponse);
  }

  /**
   * fetch a list of villages from the server
   * @public
   */
  function villages() {
    return request('/villages');
  }


  /**
   * fetch a list of sectors from the server
   * @public
   */
  function sectors() {
    return request('/sectors');
  }

  /**
   * fetch a list of provinces from the server
   * @public
   */
  function provinces() {
    return request('/provinces');
  }

  /**
   * fetch a list of countries from the server
   * @public
   */
  function countries() {
    return request('/countries');
  }

  /**
   * fetch the village, sector, province, and country for a particular village
   * uuid from the database.
   *
   * @param {String} a village uuid to look up
   * @public
   */
  function location(uuid) {
    return request('detail/'.concat(uuid));
  }

  return service;
}
