angular.module('bhima.services')
  .service('PatientInvoiceService', PatientInvoiceService);

PatientInvoiceService.$inject = [ '$http', 'util' ];

/**
 * Patient Invoice Service
 *
 * Allows direct querying of the /sales API.  Normally this should be done
 * through the PatientService, but for queries not tied to particular patients,
 * this service is particularly useful.
 */
function PatientInvoiceService($http, util) {
  var service = this;
  var baseUrl = '/sales/';

  service.read = read;
  service.reference = reference;

  /**
   * @method read
   *
   * @description
   * Retrieves a particular sale by UUID or a list of all sales if no UUID is
   * specified.
   *
   * @param {String} uuid (optional) - the uuid of the patient invoice to look
   *   up in the database.
   * @param {Object} options (optional) - options to be passed as query string
   *   parameters to the http request
   * @returns {Promise} promise - the result of the HTTP request
   */
  function read(uuid, options) {
    var target = baseUrl.concat(uuid || '');
    return $http.get(target)
      .then(util.unwrapHttpResponse);
  }

  /**
   * @method reference
   *
   * @description
   * Searches for a particular patient invoice by its reference
   *
   * @param {string} ref - the reference to search for
   * @returns {promise} promise - a resolved or rejected result from the server
   */
  function reference(ref) {
    var target = baseUrl + 'references/' + ref;
    return $http.get(target)
      .then(util.unwrapHttpResponse);
  }

  return service;
}
