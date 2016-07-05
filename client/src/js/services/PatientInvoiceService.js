angular.module('bhima.services')
  .service('PatientInvoiceService', PatientInvoiceService);

PatientInvoiceService.$inject = [
  '$http', '$uibModal', 'util', 'SessionService'
];

/**
 * Patient Invoice Service
 *
 * Allows direct querying of the /invoices API.  Normally this should be done
 * through the PatientService, but for queries not tied to particular patients,
 * this service is particularly useful.
 */
function PatientInvoiceService($http, Modal, util, Session) {
  var service = this;
  var baseUrl = '/invoices/';

  service.read = read;
  service.reference = reference;
  service.create = create;
  service.search = search;
  service.openSearchModal = openSearchModal;
  service.formatFilterParameters = formatFilterParameters;

  /**
   * @method read
   *
   * @description
   * Retrieves a particular invoice by UUID or a list of all invoices if no UUID is
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

    return $http.post(baseUrl, { invoice : invoice })
      .then(util.unwrapHttpResponse);
  }

  /**
   * @method search
   *
   * @description
   * This method is responsible for searching for invoice(s) based on passed parameters
   *
   * @param {Object} options - query string parameters to be passed to $http for
   *   serialization.
   *
   * @returns {Promise} - a promise resolving to the HTTP result.
   */
  function search (options) {
    var target = baseUrl.concat('search');

    return $http.get(target, { params : options })
        .then(util.unwrapHttpResponse);
  }

  // utility methods

  // remove the source items from invoice items - if they exist
  function filterInventorySource(item) {
    delete item.code;
    delete item.description;
    delete item._valid;
    delete item._invalid;
    delete item._initialised;
    delete item._hasPriceList;

    return item;
  }

  // open a dialog box to help user filtering invoices
  function openSearchModal(filters) {
    return Modal.open({
      templateUrl : 'partials/patient_invoice/registry/search.modal.html',
      size : 'md',
      animation : true,
      keyboard  : false,
      controller : 'InvoiceRegistrySearchModalController as ModalCtrl',
      resolve: {
        filters : function filtersProvider() { return filters; }
      }
    }).result;
  }

  /**
   * This function prepares the headers for invoice properties which were filtered,
   * Special treatment occurs when processing data related to the date
   * @todo - this might be better in its own service
   */
  function formatFilterParameters(params) {
    var columns = [
      { field: 'is_distributable', displayName: 'FORM.LABELS.DISTRIBUTABLE' },
      { field: 'service_id', displayName: 'FORM.LABELS.SERVICE' },
      { field: 'user_id', displayName: 'FORM.LABELS.USER' },
      { field: 'reference', displayName: 'FORM.LABELS.REFERENCE' },
      { field: 'billingDateFrom', displayName: 'FORM.LABELS.DATE', comparitor: '>', ngFilter:'date' },
      { field: 'billingDateTo', displayName: 'FORM.LABELS.DATE', comparitor: '<', ngFilter:'date' },
    ];

    // returns columns from filters
    return columns.filter(function (column) {
      let value = params[column.field];

      if (angular.isDefined(value)) {
        column.value = value;
        return true;
      } else {
        return false;
      }
    });
  }

  return service;
}
