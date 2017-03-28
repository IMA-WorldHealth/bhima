angular.module('bhima.services')
  .service('PatientInvoiceService', PatientInvoiceService);

PatientInvoiceService.$inject = [
  '$uibModal', 'util', 'SessionService', 'PrototypeApiService', 'FilterService'
];

/**
 * Patient Invoice Service
 *
 * Allows direct querying of the /invoices API.  Normally this should be done
 * through the PatientService, but for queries not tied to particular patients,
 * this service is particularly useful.
 */
function PatientInvoiceService(Modal, util, Session, Api, Filters) {
  var service = new Api('/invoices/');

  var filter = new Filters();

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
  function create(invoice, invoiceItems, billingServices, subsidies, description) {
    var cp = angular.copy(invoice);

    // add project id from session
    cp.project_id = Session.project.id;

    // a patient invoice is not required to qualify for billing services or subsidies
    // default to empty arrays
    billingServices = billingServices || [];
    subsidies = subsidies || [];

    // concatenate into a single object to send back to the client
    cp.items = invoiceItems.map(filterInventorySource);

    cp.billingServices = billingServices.map(function (billingService) {
      return billingService.billing_service_id;
    });

    cp.subsidies = subsidies.map(function (subsidy) {
      return subsidy.subsidy_id;
    });

    cp.description = description;

    return Api.create.call(this, { invoice: cp });
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
    var url = '/invoices/'.concat(uuid, '/balance');
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
      templateUrl : 'modules/invoices/registry/search.modal.html',
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
      templateUrl : 'modules/invoices/registry/modalCreditNote.html',
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
      { field: 'debtor_uuid', displayName: 'FORM.LABELS.CLIENT' },
      { field : 'patientReference', displayName: 'FORM.LABELS.REFERENCE_PATIENT'},
      { field: 'billingDateFrom', displayName: 'FORM.LABELS.DATE', comparitor: '>', ngFilter:'date' },
      { field: 'billingDateTo', displayName: 'FORM.LABELS.DATE', comparitor: '<', ngFilter:'date' },
      { field: 'reversed', displayName : 'FORM.INFO.CREDIT_NOTE' },
      { field: 'defaultPeriod', displayName : 'TABLE.COLUMNS.PERIOD', ngFilter : 'translate' },
    ];

    // returns columns from filters
    return columns.filter(function (column) {
      var value = params[column.field];

      if (angular.isDefined(value)) {
        column.value = value;

        // @FIXME tempoarary hack for default period
        if (column.field === 'defaultPeriod') {
          column.value = filter.lookupPeriod(value).label;
        }
        return true;
      } else {
        return false;
      }
    });
  }

  return service;
}
