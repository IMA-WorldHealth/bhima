angular.module('bhima.services')
  .service('PatientInvoiceService', PatientInvoiceService);

PatientInvoiceService.$inject = [ '$http', 'util', 'SessionService' ];

/**
 * Patient Invoice Service
 *
 * Allows direct querying of the /sales API.  Normally this should be done
 * through the PatientService, but for queries not tied to particular patients,
 * this service is particularly useful.
 */
function PatientInvoiceService($http, util, Session) {
  var service = this;
  var baseUrl = '/sales/';

  service.read = read;
  service.reference = reference;
  service.create = create;

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
   * @param {String} ref - the reference to search for
   * @returns {Promise} promise - a resolved or rejected result from the server
   */
  function reference(ref) {
    var target = baseUrl + 'references/' + ref;
    return $http.get(target)
      .then(util.unwrapHttpResponse);
  }

  /**
   * @method create
   *
   * @description
   * This method formats and submits an invoice to the server from the PatientInvoiceController
   *
   * @returns {Promise} - a promise resolving to the HTTP result.
   */
  function create(invoice, invoiceItems, billingServices, subsidies) {

    // add project id from session
    invoice.project_id = Session.project.id;

    // a patient invoice is not required to qualify for billing services or subsidies
    // default to empty arrays
    billingServices = billingServices || [];
    subsidies = subsidies || [];

    // concat into a single object to send back to the client
    invoice.items = invoiceItems.map(filterInventorySource);
    invoice.billingServices = billingServices;
    invoice.subsidies = subsidies;

    return $http.post(baseUrl, { sale : invoice })
      .then(util.unwrapHttpResponse);
  }

  // utility methods

  // remove the source items from invoice items - if they exist
  function filterInventorySource(item) {
    delete item.description;
    delete item.confirmed;
    delete item.code;
    delete item.priceListApplied;
    return item;
  }

  return service;
}
