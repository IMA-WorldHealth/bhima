angular.module('bhima.controllers')
  .controller('InvoiceRegistryController', InvoiceRegistryController);

InvoiceRegistryController.$inject = [
  'PatientInvoiceService', 'bhConstants', 'NotifyService',
  'SessionService', 'ReceiptModal', 'appcache', 'uiGridConstants',
  'ModalService', 'CashService', 'GridSortingService', '$state', 'FilterService',
];

/**
 * Invoice Registry Controller
 *
 * This module is responsible for the management of Invoice Registry.
 */
function InvoiceRegistryController(Invoices, bhConstants, Notify, Session, Receipt, AppCache, uiGridConstants, ModalService, Cash, Sorting, $state, Filters) {
  var vm = this;

  var cache = AppCache('InvoiceRegistry');

  var filter = new Filters();
  vm.filter = filter;

  // Background color for make the difference betwen the valid and cancel invoice
  var reversedBackgroundColor = { 'background-color': '#ffb3b3'};
  var regularBackgroundColor = { 'background-color': 'none' };
  var FILTER_BAR_HEIGHT = bhConstants.grid.FILTER_BAR_HEIGHT;

  vm.search = search;
  vm.openReceiptModal = Receipt.invoice;
  vm.creditNoteReceipt = Receipt.creditNote;
  vm.onRemoveFilter = onRemoveFilter;
  vm.clearFilters = clearFilters;
  vm.creditNote = creditNote;
  vm.bhConstants = bhConstants;
  vm.filterBarHeight = {};

  // track if module is making a HTTP request for invoices
  vm.loading = false;
  vm.enterprise = Session.enterprise;

  var columnDefs = [
    { field : 'reference',
      displayName : 'TABLE.COLUMNS.REFERENCE',
      headerCellFilter: 'translate',
      aggregationType: uiGridConstants.aggregationTypes.count,
      aggregationHideLabel : true,
      footerCellClass : 'text-center',
      sortingAlgorithm : Sorting.algorithms.sortByReference
    },
    { field : 'date', cellFilter:'date', displayName : 'TABLE.COLUMNS.BILLING_DATE', headerCellFilter : 'translate', type: 'date' },
    { name : 'patientName', displayName : 'TABLE.COLUMNS.PATIENT', headerCellFilter : 'translate', cellTemplate : '/modules/patients/templates/linkPatient.cell.html' },
    { field : 'cost',
      displayName : 'TABLE.COLUMNS.COST',
      headerCellFilter : 'translate',
      cellFilter: 'currency:' + Session.enterprise.currency_id,
      aggregationType: uiGridConstants.aggregationTypes.sum,
      aggregationHideLabel : true,
      footerCellClass : 'text-right',
      type: 'number',
      footerCellFilter: 'currency:' + Session.enterprise.currency_id,
    },
    { field : 'serviceName', displayName : 'TABLE.COLUMNS.SERVICE', headerCellFilter : 'translate' },
    { field : 'display_name', displayName : 'TABLE.COLUMNS.BY', headerCellFilter : 'translate' },
    { name : 'credit_action', displayName : '', cellTemplate : '/modules/invoices/registry/templates/action.cell.html', enableSorting: false }
  ];

  //setting columns names
  vm.uiGridOptions = {
    appScopeProvider  : vm,
    showColumnFooter  : true,
    enableColumnMenus : false,
    enableSorting     : true,
    fastWatch         : true,
    flatEntityAccess  : true,
    columnDefs        : columnDefs,
    rowTemplate       : '/modules/invoices/templates/grid.creditNote.tmpl.html',
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
      invoices.forEach(function (invoice) {
        invoice._backgroundColor = invoice.reversed ? reversedBackgroundColor : regularBackgroundColor
        invoice._is_cancelled = invoice.reversed;
      });

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
    filters = filter.applyDefaults(filters);
    vm.filters = cache.filters = filters;

    vm.filtersFmt = Invoices.formatFilterParameters(filters);

    // show filter bar as needed
    vm.filterBarHeight = (vm.filtersFmt.length > 0) ? FILTER_BAR_HEIGHT : {};
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
    load(vm.filters);
  }

  // startup function. Checks for cached filters and loads them.  This behavior could be changed.
  function startup() {
    // @TODO standardise loading/ caching/ assigning filters with a client service
    // if filters are directly passed in through params, override cached filters
    if ($state.params.filters) {
      cacheFilters($state.params.filters);
    }

    if (!cache.filters) { cache.filters = {}; }
    var filters = filter.applyDefaults(cache.filters);

    vm.filters = filters;
    vm.filtersFmt = Invoices.formatFilterParameters(vm.filters || {});
    load(vm.filters);

    // show filter bar as needed
    vm.filterBarHeight = (vm.filtersFmt.length > 0) ? FILTER_BAR_HEIGHT : {};
  }

 // Call the opening of Modal
  function openModal(invoice) {
    Invoices.openCreditNoteModal(invoice)
      .then(function (success) {
        if (success) {
          Notify.success('FORM.INFO.TRANSACTION_REVER_SUCCESS');
          return load(vm.filters);
        }
      })
      .catch(Notify.handleError);
  }

  // Function for Credit Note cancel all Invoice
  function creditNote(invoice) {
    Cash.checkCashPayment(invoice.uuid)
      .then(function (res) {
        var numberPayment = res.length;
        if (numberPayment > 0) {
          ModalService.confirm('FORM.DIALOGS.CONFIRM_CREDIT_NOTE')
            .then(function (bool) {
              if (bool) {
                openModal(invoice);
              }
            });
        } else {
          openModal(invoice);
        }
      })
      .catch(Notify.handleError);
  }

  // fire up the module
  startup();
}
