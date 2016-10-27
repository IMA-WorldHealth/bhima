angular.module('bhima.controllers')
.controller('InvoiceRegistryController', InvoiceRegistryController);

InvoiceRegistryController.$inject = [
  'PatientInvoiceService', 'bhConstants', 'NotifyService',
  'SessionService', 'util', 'ReceiptModal', 'appcache',
  'uiGridConstants'
];

/**
 * Invoice Registry Controller
 *
 * This module is responsible for the management of Invoice Registry.
 */
function InvoiceRegistryController(Invoices, bhConstants, Notify, Session, util, Receipt, AppCache, uiGridConstants) {
  var vm = this;

  var cache = AppCache('InvoiceRegistry');

  var invoiceActionsTemplate =
    '<div class="ui-grid-cell-contents">' +
      '<a href ng-click="grid.appScope.openReceiptModal(row.entity.uuid)" data-method="receipt">' +
        '<span class="fa fa-file-pdf-o"></span> {{ "TABLE.COLUMNS.RECEIPT" | translate }}' +
      '</a>' +
      '&nbsp;&nbsp;' +
      '<a href id="{{row.entity.reference}}" ng-click="grid.appScope.creditNote(row.entity)" class="text-danger">' +
        '<i class="fa fa-clone"></i> {{ "TABLE.COLUMNS.CREDIT_NOTE" | translate }}' +
      '</a>' +
    '</div>';

  var costTemplate =
    '<div class="ui-grid-cell-contents text-right">' +
      '{{ row.entity.cost | currency: grid.appScope.enterprise.currency_id }}' +
    '</div>';

  vm.search = search;
  vm.openReceiptModal = Receipt.invoice;
  vm.onRemoveFilter = onRemoveFilter;
  vm.clearFilters = clearFilters;
  vm.creditNote = creditNote;
  vm.bhConstants = bhConstants;

  // track if module is making a HTTP request for invoices
  vm.loading = false;
  vm.enterprise = Session.enterprise;

  //setting columns names
  vm.uiGridOptions = {
    appScopeProvider : vm,
    showColumnFooter : true,
    enableColumnMenus : false,
    columnDefs : [
      { field : 'reference',
        displayName : 'TABLE.COLUMNS.REFERENCE',
        headerCellFilter: 'translate',
        aggregationType: uiGridConstants.aggregationTypes.count
      },
      { field : 'date', cellFilter:'date', displayName : 'TABLE.COLUMNS.BILLING_DATE', headerCellFilter : 'translate' },
      { field : 'patientName', displayName : 'TABLE.COLUMNS.PATIENT', headerCellFilter : 'translate' },
      { field : 'cost',
        displayName : 'TABLE.COLUMNS.COST',
        headerCellFilter : 'translate',
        cellTemplate: costTemplate,
        aggregationType: uiGridConstants.aggregationTypes.sum,
        footerCellFilter: 'currency:grid.appScope.enterprise.currency_id'
      },
      { field : 'serviceName', displayName : 'TABLE.COLUMNS.SERVICE', headerCellFilter : 'translate'  },
      { field : 'display_name', displayName : 'TABLE.COLUMNS.BY', headerCellFilter : 'translate' },
      { name : 'Actions', displayName : '', cellTemplate : invoiceActionsTemplate }
    ],
    enableSorting : true,
    rowTemplate : '/partials/patient_invoice/templates/grid.creditNote.tmpl.html'
  };

  function handler(error) {
    vm.hasError = true;
    Notify.handleError(error);
  }

  function toggleLoadingIndicator() {
    vm.loading = !vm.loading;
  }

  // this function loads invoices from the database with search parameters
  // if passed in.
  function load(parameters) {

    // flush error and loading states
    vm.hasError = false;
    toggleLoadingIndicator();

    // if we have search parameters, use search.  Otherwise, just read all
    // invoices.
    var request = angular.isDefined(parameters) ?
      Invoices.search(parameters) :
      Invoices.read();

    // hook the returned patients up to the grid.
    request.then(function (invoices) {
      // put data in the grid
      vm.uiGridOptions.data = invoices;
    })
    .catch(handler)
    .finally(function () {
      toggleLoadingIndicator();
    });
  }

  // search and filter data in Invoice Registry
  function search() {
    Invoices.openSearchModal(vm.filters)
      .then(function (parameters) {
        // no parameters means the modal was dismissed.
        if (!parameters) { return; }

        cacheFilters(parameters);
        return load(vm.filters);
      });
  }

  // save the parameters to use later.  Formats the parameters in filtersFmt for the filter toolbar.
  function cacheFilters(filters) {
    vm.filters = cache.filters = filters;
    vm.filtersFmt = Invoices.formatFilterParameters(filters);
  }

  // remove a filter with from the filter object, save the filters and reload
  function onRemoveFilter(key) {
    delete vm.filters[key];
    cacheFilters(vm.filters);
    load(vm.filters);
  }

  // clears the filters by forcing a cache of an empty array
  function clearFilters() {
    cacheFilters({});
    load();
  }

  // startup function. Checks for cached filters and loads them.  This behavior could be changed.
  function startup() {
    vm.filters = cache.filters;
    vm.filtersFmt = Invoices.formatFilterParameters(cache.filters || {});
    load(vm.filters);
  }

  // Function for Credit Note cancel all Invoice
  function creditNote(invoice) {
    Invoices.openCreditNoteModal(invoice)
      .then(function (success) {
        if (success) {
          Notify.success('FORM.INFO.TRANSACTION_REVER_SUCCESS');
          return load();
        }
      });
  }

  // fire up the module
  startup();
}
