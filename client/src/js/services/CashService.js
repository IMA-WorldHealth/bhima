/**
 * CashService
 *
 * This service interacts with the server-side /cash API.
 *
 * @module services/CashService
 */

angular.module('bhima.services')
.service('CashService', CashService);

CashService.$inject = [ '$http', 'util' ];

/**
 * A service to interact with the server-side /cash API.
 *
 * @constructor CashService
 */
function CashService($http, util) {
  var service = this;
  var baseUrl = '/cash';

  service.read = read;
  service.create = create;
  service.update = update;
  service.delete = remove;

  /**
   * Fetchs cash payments from the server.  If an uuid is specified, will read a
   * single JSON out of the service, otherwise, fetches every cash payment in the
   * database.
   *
   * @method read
   * @param {string} uuid A cash payment UUID
   * @returns {object|array} payments One or more cash payments.
   */
  function read(uuid, options) {
    var target = (uuid) ?
      baseUrl + '/' + uuid :
      baseUrl;

    return $http.get(target, options)
      .then(util.unwrapHttpResponse);
  }

  /**
   * Creates a cash payment from a JSON passed from a form.
   *
   * @method create
   * @param {object} data A JSON object containing the cash payment record defn
   * @returns {object} payment A promise resolved with the database uuid.
   */
  function create(data) {
    return $http.post(baseUrl, data)
      .then(util.unwrapHttpResponse);
  }

  /**
   * Fetchs cash payments from the server.  If an id is specified, will read a single
   * JSON out of the service, otherwise, fetches every cash payment in the database.
   *
   * @method update
   * @param {string} uuid A cash payment UUID
   * @returns {object} payments A promise containing the entire cash payment record
   */
  function update(uuid, data) {
    var target = baseUrl + '/' + uuid;
    return $http.put(target, data)
      .then(util.unwrapHttpResponse);
  }

  /**
   * Deletes cash payments from the database based on the id passed in.
   *
   * @method delete
   * @param {string} uuid A cash payment UUID
   * @returns Promise A resolved or rejected empty promise
   */
  function remove(uuid) {
    var target = baseUrl + '/' + uuid;

    // Technically, we are not returning any body, so unwrappHttpResponse does
    // not do anything.  However, to keep uniformity with the API, I've included
    // it.
    return $http.delete(target)
      .then(util.unwrapHttpResponse);
  }
}
