angular.module('bhima.services')
.service('PrototypeApiService', PrototypeApiService);

PrototypeApiService.$inject = ['$http', 'util'];

/**
 * @class PrototypeApiService
 *
 * @description
 * This service is the parent/prototype of all API services throughout the
 * application.  It defines the basic methods to be implemented and parameters
 * that are required for each.  Full CRUD is implemented in this service,
 * extending from a base url.
 *
 * Child services are expected to use angular.extend() to inherit the basic
 * methods and properties from this service.
 *
 * @requires $http
 * @requires util
 */
function PrototypeApiService($http, util) {

  /** bind the required $http and util services */
  this.$http = $http;
  this.$util = util;

  // basic API methods
  this.create = create;
  this.read = read;
  this.update = update;
  this.delete = remove;

  /**
   * @method read
   *
   * @description
   * Sends an HTTP GET request to the url "/route" or "route/:id".  If an id is
   * provided, the id is appended to the base url before sending the request.
   * Otherwise, the request is made against the base url.
   *
   * Optional parameters may be provided as the second parameter to be passed as
   * query string parameters to $http.
   *
   * @param {Number|String|Null} id - the optional identifier of the URL route.
   * @param {Object|Null} params - optional parameters to be passed to $http
   * @returns {Promise} - the promise with the requested data
   *
   * @example
   * // GETting data from the base /route/
   * service.read().then(function (data) {
   *   // data is an array of values
   * })
   *
   * // GETting data from the /route/:id
   * service.read(id).then(function (data) {
   *   // data is typically an object here
   * });
   *
   * // GETting data with query string params
   * // /route?limit=10&detailed=1
   * service.read(null, { limit : 10, detailed : 1 })
   *   .then(function (data) {
   *     // data is typically an array here
   *   });
   */
  function read(id, parameters) {

    // default to empty object for paramters
    parameters = parameters || {};

    // append the id to the target
    var target = this.url.concat(id || '');

    // send the GET request
    return this.$http.get(target, { params : parameters })
      .then(util.unwrapHttpResponse);
  }

  /**
   * @method update
   *
   * @description
   * Sends an HTTP PUT request to the url `/route/:id` with properties to update in
   * the database.  The method removes any identifiers (id, uuid) if they exist
   * on the object to avoid changing references in the database.
   *
   * @param {Number|String|Null} id - the optional identifier of the URL route.
   * @param {Object|Null} data - the changed data to be updated in the database
   * @returns {Promise} - the promise with the full changed object
   *
   * @example
   * // PUT data to the url "/route/1"
   * service.update(1, { name : "Hope" }).then(function (data) {
   *   // data is a JSON with the full record's properties
   * });
   */
  function update(id, data) {

    // remove identifers before update command
    delete data.id;
    delete data.uuid;

    // append the id to the base url
    var target = this.url.concat(id);

    // send the PUT request
    return this.$http.put(target, data)
      .then(util.unwrapHttpResponse);
  }

  /**
   * @method create
   *
   * @description
   * Sends an HTTP POST request to the url `/route` with the record properties
   * in the HTTP body.
   *
   * @param {Object|Null} data - the record data to be create in the database
   * @returns {Promise} - the promise with the identifier from the database
   *   resolving to the created record identifier
   *
   * @example
   * // POST data to the url "/route"
   * service.create({ text : "Hello World!" }).then(function (data) {
   *   // data an object containing the identifier.  Usually "id" or "uuid"
   * });
   */
  function create(data) {

    // the target is the base URL
    var target = this.url;

    // send the POST request
    return this.$http.post(target, data)
      .then(util.unwrapHttpResponse);
  }

  /**
   * @method delete
   *
   * @description
   * Sends an HTTP DELETE request to the url "/route/:id" to delete an object
   * from the database.  The expected response is a `204 No Content` HTTP status
   * code.
   *
   * @param {Number|String|Null} id - the identifier of the URL route.
   * @returns {Promise} - the promise with the identifier from the database
   *
   * @example
   * // POST data to the url "/route"
   * service.create({ text : "Hello World!" }).then(function (data) {
   *   // data an object containing the identifier.  Usually "id" or "uuid"
   * });
   */
  function remove(id) {

    // append the id to the base url
    var target = this.url.concat(id);

    // send the DELETE request
    return this.$http.delete(target)
      .then(util.unwrapHttpResponse);
  }
}
