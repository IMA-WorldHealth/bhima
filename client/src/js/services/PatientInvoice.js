/**
 * PatientInvoice Service
 *
 * Service to interact with the /patient_invoice HTTP end point. Responsible
 * for curating data provided from the patient invoice controller and formatting
 * it for submission to be written on the server.
 *
 * @module services/PatientInvoice
 */
angular.module('bhima.services')
.service('PatientInvoice', PatientInvoice);

PatientInvoice.$inject = [ '$http', 'util', 'SessionService' ];

/**
 * @constructor PatientInvoice
 */
function PatientInvoice($http, util, Session) {
  var service = this;
  var baseUrl = '/sales';

  /** method to format and send a valid patient invoice request. */
  service.create = create;

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
    delete item.sourceInventoryItem;
    delete item.description;
    delete item.confirmed;
    delete item.code;
    delete item.priceListApplied;

    return item;
  }
}
