angular.module('bhima.services')
  .service('PatientInvoiceService', PatientInvoiceService);

PatientInvoiceService.$inject = [
  '$uibModal', 'util', 'SessionService', 'PrototypeApiService'
];

/**
 * Patient Invoice Service
 *
 * Allows direct querying of the /invoices API.  Normally this should be done
 * through the PatientService, but for queries not tied to particular patients,
 * this service is particularly useful.
 */
function PatientInvoiceService(Modal, util, Session, Api) {
  var service = new Api('/invoices/');

  service.create = create;
  service.openSearchModal = openSearchModal;
  service.formatFilterParameters = formatFilterParameters;
  service.openCreditNoteModal = openCreditNoteModal;
  service.balance = balance;

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

    // concatenate into a single object to send back to the client
    invoice.items = invoiceItems.map(filterInventorySource);

    invoice.billingServices = billingServices.map(function (billingService) {
      return billingService.billing_service_id;
    });

    invoice.subsidies = subsidies.map(function (subsidy) {
      return subsidy.subsidy_id;
    });

    return Api.create.call(this, { invoice: invoice });
  }

  /**
   * @method balance
   *
   * @description
   * This method returns the balance on an invoice due to a debtor.
   *
   * @param {String} uuid - the invoice uuid
   * @param {String} debtorUuid - the amount due to the debtor
   */
  function balance(uuid) {
    var url = '/invoices/'.concat(uuid).concat('/balance');
    return this.$http.get(url)
      .then(this.util.unwrapHttpResponse);
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
      animation : false,
      keyboard  : false,
      backdrop : 'static',
      controller : 'InvoiceRegistrySearchModalController as ModalCtrl',
      resolve: {
        filters : function filtersProvider() { return filters; }
      }
    }).result;
  }

  //open a dialog box to Cancel Credit Note
  function openCreditNoteModal(invoice) {
    return Modal.open({
      templateUrl : 'partials/patient_invoice/registry/modalCreditNote.html',
      resolve : { data : { invoice : invoice } },
      size : 'md',
      animation : true,
      keyboard  : false,
      backdrop : 'static',
      controller : 'ModalCreditNoteController as ModalCtrl',
    }, true).result;
  }

  /**
   * This function prepares the headers for invoice properties which were filtered,
   * Special treatment occurs when processing data related to the date
   * @todo - this might be better in its own service
   */
  function formatFilterParameters(params) {
    var columns = [
      { field: 'service_id', displayName: 'FORM.LABELS.SERVICE' },
      { field: 'user_id', displayName: 'FORM.LABELS.USER' },
      { field: 'reference', displayName: 'FORM.LABELS.REFERENCE' },
      { field: 'billingDateFrom', displayName: 'FORM.LABELS.DATE', comparitor: '>', ngFilter:'date' },
      { field: 'billingDateTo', displayName: 'FORM.LABELS.DATE', comparitor: '<', ngFilter:'date' },
      { field: 'patientNames', displayName : 'FORM.LABELS.PATIENT_NAME'},
    ];

    // returns columns from filters
    return columns.filter(function (column) {
      var value = params[column.field];

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
