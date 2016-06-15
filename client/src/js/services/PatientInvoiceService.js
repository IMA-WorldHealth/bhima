angular.module('bhima.services')
  .service('PatientInvoiceService', PatientInvoiceService);

PatientInvoiceService.$inject = [ '$http', '$uibModal', 'util', 'SessionService', 'UserService', 'ServiceService' ];

/**
 * Patient Invoice Service
 *
 * Allows direct querying of the /invoices API.  Normally this should be done
 * through the PatientService, but for queries not tied to particular patients,
 * this service is particularly useful.
 */
function PatientInvoiceService($http, $uibModal, util, Session, Users, Services) {
  var service = this;
  var baseUrl = '/invoices/';

  service.read = read;
  service.reference = reference;
  service.create = create;
  service.search = search;
  service.openSearchModal = openSearchModal;
  service.invoiceFilters = invoiceFilters;

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
   * This method is reponsible of seaching for invoice(s) based on passed parameters
   *
   * @returns {Promise} - a promise resolving to the HTTP result.
   */

  function search (options) {
    var target = baseUrl.concat('search');

    /*
     * Convertion of billingDateFrom and billingDateTo
     */

    if (options.billingDateFrom) {
      options.billingDateFrom = util.convertToMysqlDate(options.billingDateFrom);
    }

    if (options.billingDateTo) {
      options.billingDateTo = util.convertToMysqlDate(options.billingDateTo);
    }

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

  //open a dialog box to help user filtering invoices
  function openSearchModal() {
    return $uibModal.open({
      templateUrl : 'partials/patient_invoice/registry/modal.html',
      size : 'md',
      animation : true,
      keyboard  : false,
      controller : 'InvoiceRegistryModalController as ModalCtrl'
    }).result;
  }


  /*
   * This function prepares the headers invoice properties which were filtered,
   * Special treatment occurs when processing data related to the date
   * @todo - this might be better in it's own service
   */
  function invoiceFilters(invoice) {
    var propertyInvoiceFilter = [];
    var dataConfiguration;

    if (invoice.billingDateFrom && invoice.billingDateTo) {
      dataConfiguration = {
        title : 'FORM.LABELS.BILLING_DATE',
        reference1 : invoice.billingDateFrom,
        reference2 : invoice.billingDateTo
      };
      propertyInvoiceFilter.push(dataConfiguration);
    }

    if (invoice.reference) {
      dataConfiguration = {
        title : 'FORM.LABELS.REFERENCE',
        reference1 : invoice.reference,
      };
      propertyInvoiceFilter.push(dataConfiguration);
    }
    if (invoice.service_id) {
        
        Services.read(invoice.service_id)
            .then(function (data) {
                dataConfiguration = {
                    title : 'FORM.LABELS.SERVICE',
                    reference1 : data.name
                };
                propertyInvoiceFilter.push(dataConfiguration);
            });      
    }

    if (invoice.user_id) {

        Users.read(invoice.user_id)
            .then(function (data) {
                dataConfiguration = {
                    title : 'FORM.LABELS.USER',
                    reference1 : data.displayname
                };
                propertyInvoiceFilter.push(dataConfiguration);
            });
    }

    if (invoice.is_distributable && invoice.is_distributable !== 'all') {
        var isDistributableInvoice;
        if (invoice.is_distributable === '1') {
            isDistributableInvoice = 'FORM.LABELS.YES';
        } else {
            isDistributableInvoice = 'FORM.LABELS.NO';
        }

        dataConfiguration = {
            title: 'FORM.LABELS.DISTRIBUTABLE',
            reference1: invoice.is_distributable
        };
        propertyInvoiceFilter.push(dataConfiguration);
    }
    return propertyInvoiceFilter;
  }
  return service;
}
