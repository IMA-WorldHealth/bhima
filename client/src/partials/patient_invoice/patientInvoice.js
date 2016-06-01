angular.module('bhima.controllers')
.controller('PatientInvoiceController', PatientInvoiceController);

PatientInvoiceController.$inject = [
  'PatientService', 'PatientInvoiceService', 'Invoice', 'util', 'ServiceService',
  'SessionService', 'DateService', 'ReceiptModal', 'NotifyService'
];

/**
 * Patient Invoice Controller
 *
 * @todo (required) Tabbing through UI grid. Code -> Quantity -> Price
 * @todo (required) Design and implement how cautions are assigned. Client vs. Server
 * @todo (required) Sale made outside of fiscal year error should be handled and shown to user
 * @todo (required) Billing services and subsidies should be ignored for specific debtors
 * @todo Known bug - sidebar expanding and collapsing does not redraw totals columns (listen and update?)
 * @todo Total rows formatted to show subsidy as subtraction and make clear running total
 *
 * @module PatientInvoiceController
 */
function PatientInvoiceController(Patients, PatientInvoices, Invoice, util, Services, Session, Dates, Receipts, Notify) {
  var vm = this;
  vm.Invoice = new Invoice();

  // bind the enterprise to the enterprise currency
  vm.enterprise = Session.enterprise;

  // application constants
  vm.maxLength = util.maxTextLength;
  vm.minimumDate = util.minimumDate;
  vm.itemIncrement = 1;

  var gridOptions = {
    appScopeProvider : vm,
    enableSorting : false,
    enableColumnMenus : false,
    columnDefs : [
      { field: 'status', width: 25, displayName : '', cellTemplate: 'partials/patient_invoice/templates/grid/status.tmpl.html' },
      { field: 'code', displayName: 'TABLE.COLUMNS.CODE', headerCellFilter: 'translate', cellTemplate:  'partials/patient_invoice/templates/grid/code.tmpl.html' },
      { field: 'description', displayName: 'TABLE.COLUMNS.DESCRIPTION', headerCellFilter: 'translate' },
      { field: 'quantity', displayName: 'TABLE.COLUMNS.QUANTITY', headerCellFilter: 'translate', cellTemplate: 'partials/patient_invoice/templates/grid/quantity.tmpl.html' },
      { field: 'transaction_price', displayName: 'TABLE.COLUMNS.TRANSACTION_PRICE', headerCellFilter: 'translate', cellTemplate: 'partials/patient_invoice/templates/grid/unit.tmpl.html' },
      { field: 'amount', displayName: 'TABLE.COLUMNS.AMOUNT', headerCellFilter: 'translate', cellTemplate: 'partials/patient_invoice/templates/grid/amount.tmpl.html' },
      { field: 'actions', width : 25, cellTemplate: 'partials/patient_invoice/templates/grid/actions.tmpl.html' }
    ],
    onRegisterApi : exposeGridScroll,
    data : vm.Invoice.rows.rows
  };

  // called when the grid is initialized
  function exposeGridScroll(gridApi) {
    vm.gridApi = gridApi;
  }

  function setPatient(patient) {
    var uuid = patient.uuid;
    Patients.read(uuid)
    .then(function (patient) {
      vm.Invoice.setPatient(patient);
    });
  }

  // Invoice total and items are successfully sent and written to the server
  // - Billing services are sent to the server but NOT recorded
  // - Subsidies are sent to the server but NOT recorded
  // - TODO the final value of a sale can only be determined after checking all
  //        billing services, subsidies and the cost of the sale
  function submit(detailsForm) {
    var items = angular.copy(vm.Invoice.rows.rows);
    console.log('vm.Invoice.rows', vm.Invoice.rows);

    // update value for form validation
    detailsForm.$setSubmitted();

    // if the form is invalid, return right away
    if (detailsForm.$invalid) {
      Notify.danger('FORM.ERRORS.RECORD_ERROR');
      return;
    }

    // ask service items to validate themselves - if anything is returned it is invalid
    var invalidItems = vm.Invoice.rows.validate();

    if (invalidItems.length) {
      Notify.danger('PATIENT_INVOICE.INVALID_INVOICE_ITEMS');

      var firstInvalidItem = invalidItems[0];

      // show the user where the error is
      vm.gridApi.core.scrollTo(firstInvalidItem);
      return;
    }

    // invoice consists of
    // 1. Invoice details
    // 2. Invoice items
    // 3. Charged billing services - each of these have the global charge calculated by the client
    // 4. Charged subsidies - each of these have the global charge calculated by the client
    PatientInvoices.create(vm.Invoice.details, items, vm.Invoice.billingServices, vm.Invoice.subsidies)
      .then(function (result) {
        detailsForm.$setPristine();
        detailsForm.$setUntouched();
        return result;
      })
      .then(handleCompleteInvoice)
      .catch(Notify.handleError);
  }

  function handleCompleteInvoice(invoice) {
    // vm.Invoice.rows.removeCache();
    clear();

    Receipts.invoice(invoice.uuid, true)
    .then(function (result) {

      // receipt closed fired
    })
    .catch(function (error) {

      // receipt closed rejected
    });
  }

  // reset everything in the controller - default values
  function clear(detailsForm) {

    // set timestamp to today
    vm.timestamp = Dates.current.day();

    vm.Invoice.rows.recovered = false;
    vm.Invoice.setup();

    /** @todo this is a bad pattern, clean this up */

    if (detailsForm) {
      detailsForm.$setPristine();
      detailsForm.$setUntouched();
    }

    if (vm.services) {
      vm.Invoice.setService(vm.services[0]);
    }

    if (vm.patientSearch) {
      vm.patientSearch.reset();
    }
  }

  vm.gridOptions = gridOptions;
  vm.setPatient = setPatient;
  vm.submit = submit;
  vm.clear = clear;

  // read in services and bind to the view
  Services.read()
  .then(function (services) {
    vm.services = services;

    // default to the first service
    vm.Invoice.setService(services[0]);
  });

  // Set initial default values
  clear();
}
