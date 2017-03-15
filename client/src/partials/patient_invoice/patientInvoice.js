angular.module('bhima.controllers')
  .controller('PatientInvoiceController', PatientInvoiceController);

PatientInvoiceController.$inject = [
  'PatientService', 'PatientInvoiceService', 'PatientInvoiceForm', 'util', 'SessionService',
  'DateService', 'ReceiptModal', 'NotifyService', 'bhConstants', '$translate',
  'ExchangeRateService',
];

/**
 * @module PatientInvoiceController
 *
 * @description
 * This module binds the Patient Invoice Form service to the view.
 *
 * @todo (required) Tabbing through UI grid. Code -> Quantity -> Price
 * @todo (required) Invoice made outside of fiscal year error should be handled and shown to user
 * @todo (requires) use a loading button for the form loading state.
 */
function PatientInvoiceController(Patients, PatientInvoices, PatientInvoiceForm, util, Session, Dates, Receipts, Notify, Constants, $translate, Exchange) {
  var vm = this;

  // bind the enterprise to get the enterprise currency id
  vm.enterprise = Session.enterprise;
  vm.Invoice = new PatientInvoiceForm('PatientInvoiceForm');
  vm.ROW_ERROR_FLAG = Constants.grid.ROW_ERROR_FLAG;

  // application constants
  vm.maxLength = util.maxTextLength;
  vm.minimumDate = util.minimumDate;
  vm.itemIncrement = 1;
  vm.onPatientSearchApiCallback = onPatientSearchApiCallback;

  $translate('FORM.LABELS.SALE').then(function (value) { vm.descriptionPrefix = value; });

  var gridOptions = {
    appScopeProvider  : vm,
    enableSorting     : false,
    enableColumnMenus : false,
    rowTemplate       : 'partials/templates/grid/error.row.html',
    columnDefs : [
      { field: 'status', width: 25, displayName : '', cellTemplate: 'partials/patient_invoice/templates/grid/status.tmpl.html' },
      { field: 'code', displayName: 'TABLE.COLUMNS.CODE', headerCellFilter: 'translate', cellTemplate:  'partials/patient_invoice/templates/grid/code.tmpl.html' },
      { field: 'description', displayName: 'TABLE.COLUMNS.DESCRIPTION', headerCellFilter: 'translate' },
      { field: 'quantity', displayName: 'TABLE.COLUMNS.QUANTITY', headerCellFilter: 'translate', cellTemplate: 'partials/patient_invoice/templates/grid/quantity.tmpl.html' },
      { field: 'transaction_price', displayName: 'FORM.LABELS.UNIT_PRICE', headerCellFilter: 'translate', cellTemplate: 'partials/patient_invoice/templates/grid/unit.tmpl.html' },
      { field: 'amount', displayName: 'TABLE.COLUMNS.AMOUNT', headerCellFilter: 'translate', cellTemplate: 'partials/patient_invoice/templates/grid/amount.tmpl.html' },
      { field: 'actions', width: 25, cellTemplate: 'partials/patient_invoice/templates/grid/actions.tmpl.html' },
    ],
    onRegisterApi : exposeGridScroll,
    data          : vm.Invoice.store.data,
  };


  // called when the grid is initialized
  function exposeGridScroll(gridApi) {
    vm.gridApi = gridApi;
  }

  function setPatient(p) {
    var uuid = p.uuid;
    Patients.read(uuid)
      .then(function (patient) {
        vm.Invoice.setPatient(patient);
        updateDescription();
        return Patients.balance(patient.debtor_uuid);
      })
      .then(function (balance) {
        vm.patientBalance = balance;
      });
  }

  // invoice total and items are successfully sent and written to the server
  function submit(detailsForm) {
    var items;
    var invalidItems;
    var firstInvalidItem;

    vm.Invoice.writeCache();

    // update value for form validation
    detailsForm.$setSubmitted();

    // make sure there are actually items to validate
    if (vm.Invoice.store.data.length === 0) {
      Notify.danger('PATIENT_INVOICE.INVALID_ITEMS');
      return;
    }

    // ask service items to validate themselves - if anything is returned it is invalid
    invalidItems = vm.Invoice.validate(true);

    if (invalidItems.length) {
      firstInvalidItem = invalidItems[0];
      Notify.danger(firstInvalidItem._message);

      // show the user where the error is
      vm.gridApi.core.scrollTo(firstInvalidItem);
      return;
    }

    // if the form is invalid, return right away
    if (detailsForm.$invalid) {
      Notify.danger('FORM.ERRORS.RECORD_ERROR');
      return;
    }

    console.log('vm.Invoice:', vm.Invoice);

    // copy the rows for insertion
    items = angular.copy(vm.Invoice.store.data);

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

  // this function will be called whenever items change in the grid.
  function handleUIGridChange() {
    vm.Invoice.digest();
  }

  // adds n items to the grid (unless the inventory is used up)
  function addItems(n) {
    while (n--) {
      vm.Invoice.addItem();
    }
  }

  function handleCompleteInvoice(invoice) {
    vm.Invoice.clearCache();

    Receipts.invoice(invoice.uuid, true)
      .then(function () { clear(); });
  }

  // register the patient search api
  function onPatientSearchApiCallback(api) {
    vm.patientSearchApi = api;
  }

  function updateDescription() {
    if (vm.Invoice.recipient) {
      vm.Invoice.details.description = [
        vm.descriptionPrefix,
        vm.Invoice.recipient.display_name,
        vm.Invoice.service.name,
      ].join('/');
    }
  }

  // reset everything in the controller - default values
  function clear(detailsForm) {
    // set timestamp to today
    vm.timestamp = Dates.current.day();

    vm.Invoice.setup();

    if (detailsForm) {
      detailsForm.$setPristine();
      detailsForm.$setUntouched();
    }

    // reset the find patient component
    if (vm.patientSearchApi) {
      vm.patientSearchApi.reset();
    }

    // reset client balance
    vm.patientBalance = null;
  }

  vm.gridOptions = gridOptions;
  vm.setPatient = setPatient;
  vm.submit = submit;
  vm.clear = clear;
  vm.addItems = addItems;
  vm.handleChange = handleUIGridChange;

  // Set initial default values
  clear();
}
