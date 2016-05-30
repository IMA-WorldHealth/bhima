angular.module('bhima.controllers')
.controller('PatientInvoiceController', PatientInvoiceController);

PatientInvoiceController.$inject = [
  '$q', 'PatientService', 'PriceListService', 'PatientInvoice', 'Invoice', 'util',
  'ServiceService', 'SessionService', 'DateService', 'ReceiptModal',
  'NotifyService'
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
 * @module bhima/controllers/PatientInvoiceController
 */
function PatientInvoiceController($q, Patients, PriceLists, PatientInvoice, Invoice, util, Services, Session, Dates, Receipts, Notify) {
  var vm = this;
  vm.Invoice = new Invoice();

  // bind the enterprise to the enterprise currency
  vm.enterprise = Session.enterprise;

  vm.maxLength = util.maxTextLength;

  var gridOptions = {
    appScopeProvider : vm,
    enableSorting : false,
    enableColumnMenus : false,
    columnDefs : [
      { field: 'status', width: 25, displayName : '', cellTemplate : 'partials/patient_invoice/templates/grid/status.tmpl.html' },
      { field: 'code', displayName: 'TABLE.COLUMNS.CODE', headerCellFilter: 'translate', cellTemplate :  'partials/patient_invoice/templates/grid/code.tmpl.html' },
      { field: 'description', displayName: 'TABLE.COLUMNS.DESCRIPTION', headerCellFilter: 'translate' },
      { field: 'quantity', displayName: 'TABLE.COLUMNS.QUANTITY', headerCellFilter: 'translate', cellTemplate : 'partials/patient_invoice/templates/grid/quantity.tmpl.html' },
      { field: 'transaction_price', displayName: 'TABLE.COLUMNS.TRANSACTION_PRICE', headerCellFilter: 'translate', cellTemplate : 'partials/patient_invoice/templates/grid/unit.tmpl.html' },
      { field: 'amount', displayName: 'TABLE.COLUMNS.AMOUNT', headerCellFilter: 'translate', cellTemplate : 'partials/patient_invoice/templates/grid/amount.tmpl.html' },
      { field: 'actions', width : 25, cellTemplate : 'partials/patient_invoice/templates/grid/actions.tmpl.html' }
    ],
    onRegisterApi : exposeGridScroll,
    data : vm.Invoice.items.rows
  };

  // called when the grid is initialized
  function exposeGridScroll(gridApi) {
    vm.gridApi = gridApi;
  }

  function setPatient(patient) {
    var uuid = patient.uuid;

    Patients.read(uuid)
      .then(configureInvoice);
  }

  // Invoice total and items are successfully sent and written to the server
  // - Billing services are sent to the server but NOT recorded
  // - Subsidies are sent to the server but NOT recorded
  // - TODO the final value of a sale can only be determined after checking all
  //        billing services, subsidies and the cost of the sale
  function submit(detailsForm) {
    var items = angular.copy(vm.Invoice.items.rows);

    // update value for form validation
    detailsForm.$setSubmitted();

    // if the form is invalid, return right away
    if (detailsForm.$invalid) {
      Notify.danger('FORM.ERRORS.RECORD_ERROR');
      return;
    }

    // ask service items to validate themselves - if anything is returned it is invalid
    var invalidItem = vm.Invoice.items.verify();

    if (angular.isDefined(invalidItem)) {
      Notify.danger('PATIENT_INVOICE.INVALID_INVOICE_ITEMS');

      // show the user where the error is
      vm.gridApi.core.scrollTo(invalidItem);
      return;
    }

    // invoice consists of
    // 1. Invoice details
    // 2. Invoice items
    // 3. Charged billing services - each of these have the global charge calculated by the client
    // 4. Charged subsidies - each of these have the global charge calculated by the client
    PatientInvoice.create(vm.Invoice.details, items, vm.Invoice.billingServices, vm.Invoice.subsidies)
      .then(function (result) {
        detailsForm.$setPristine();
        detailsForm.$setUntouched();
        return result;
      })
      .then(handleCompleteInvoice)
      .catch(Notify.handleError);
  }

  function handleCompleteInvoice(invoice) {
    vm.Invoice.items.removeCache();
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

    /** @todo all reset values should be implicit in the Invoice service - this controller should not be concerned with this */
    // Default values
    vm.itemIncrement = 1;

    // set timestamp to today
    vm.timestamp = Dates.current.day();

    vm.minimumDate = util.minimumDate;
    vm.dateLocked = true;

    // Set default invoice date to today
    vm.Invoice.details.date = new Date();
    vm.Invoice.recipient = null;
    vm.Invoice.items.recovered = false;
    vm.Invoice.details.description = null;
    vm.Invoice.items.clearItems(true, false);

    /** @todo this is a bad pattern, clean this up */

    if (detailsForm) {
      detailsForm.$setPristine();
      detailsForm.$setUntouched();
    }
    if (vm.services) {
      vm.Invoice.details.service_id = vm.services[0].id;
    }

    if (vm.patientSearch) {
      vm.patientSearch.reset();
    }
  }

  vm.gridOptions = gridOptions;
  vm.setPatient = setPatient;
  vm.submit = submit;
  vm.clear = clear;

  // TODO potentially move this into debtor configuration within invoice
  // TODO very temporary code
  function configureInvoice(patient) {
    var configureQueue = [];

    // Prompt initial invoice item
    vm.Invoice.items.configureBase();

    configureQueue.push(Patients.billingServices(patient.uuid));
    configureQueue.push(Patients.subsidies(patient.uuid));

    if (patient.price_list_uuid) {
      configureQueue.push(PriceLists.read(patient.price_list_uuid));
    }

    $q.all(configureQueue)
      .then(function (result) {
        var billingResult = result[0];
        var subsidiesResult = result[1];
        var priceListResult = result[2];

        // TODO All of these can be settup in one method exposed by the service
        vm.Invoice.configureGlobalCosts(billingResult, subsidiesResult);
        if (priceListResult) {
          vm.Invoice.items.setPriceList(priceListResult);
        }
        vm.Invoice.recipient = patient;
        vm.Invoice.details.debtor_uuid = patient.debtor_uuid;
      });
  }

  // read in services and bind to the view
  Services.read()
  .then(function (services) {
    vm.services = services;
    vm.Invoice.details.service_id = vm.services[0].id;
  });

  // Set initial default values
  clear();
}
