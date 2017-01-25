angular.module('bhima.controllers')
  .controller('InvoiceRegistryController', InvoiceRegistryController);

InvoiceRegistryController.$inject = [
  'PatientInvoiceService', 'bhConstants', 'NotifyService',
  'SessionService', 'util', 'ReceiptModal', 'appcache',
  'uiGridConstants', 'ModalService', 'CashService'
];

/**
 * Invoice Registry Controller
 *
 * This module is responsible for the management of Invoice Registry.
 */
function InvoiceRegistryController(Invoices, bhConstants, Notify, Session, util, Receipt, AppCache, uiGridConstants, ModalService, Cash) {
  var vm = this;

  var cache = AppCache('InvoiceRegistry');

  // Background color for make the difference betwen the valid and cancel invoice
  var reversedBackgroundColor = {'background-color': '#ffb3b3' };
  var regularBackgroundColor = { 'background-color': 'none' };

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
      footerCellClass : 'text-center'
    },
    { field : 'date', cellFilter:'date', displayName : 'TABLE.COLUMNS.BILLING_DATE', headerCellFilter : 'translate', type: 'date' },
    { field : 'patientName', displayName : 'TABLE.COLUMNS.PATIENT', headerCellFilter : 'translate' },
    { field : 'cost',
      displayName : 'TABLE.COLUMNS.COST',
      headerCellFilter : 'translate',
      cellTemplate: '/partials/patient_invoice/registry/templates/cost.cell.tmpl.html',
      aggregationType: uiGridConstants.aggregationTypes.sum,
      aggregationHideLabel : true,
      footerCellClass : 'text-right',
      type: 'number',
      footerCellFilter: 'currency:' + Session.enterprise.currency_id
    },
    { field : 'serviceName', displayName : 'TABLE.COLUMNS.SERVICE', headerCellFilter : 'translate'  },
    { field : 'display_name', displayName : 'TABLE.COLUMNS.BY', headerCellFilter : 'translate' },
    { name : 'credit_action', displayName : '', cellTemplate : '/partials/patient_invoice/registry/templates/creditNote.action.tmpl.html', enableSorting: false }
  ];

  //setting columns names
  vm.uiGridOptions = {
    appScopeProvider : vm,
    showColumnFooter : true,
    enableColumnMenus : false,
    enableSorting : true,
    fastWatch: true,
    flatEntityAccess : true,
    columnDefs : columnDefs,
    rowTemplate : '/partials/patient_invoice/templates/grid.creditNote.tmpl.html'
  };

  vm.receiptOptions = {};

  // receiptOptions are used in the bh-print directive under the receipt-action template
  vm.setReceiptCurrency = function setReceiptCurrency(currencyId) {
    vm.receiptOptions.currency = currencyId;
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

    if (parameters) {
      delete parameters.patientNames;
    }

    // if we have search parameters, use search.  Otherwise, just read all
    // invoices.
    var request = angular.isDefined(parameters) ?
      Invoices.search(parameters) :
      Invoices.read();

    // hook the returned patients up to the grid.
    request.then(function (invoices) {
      invoices.forEach(function (invoice) {
        invoice._backgroundColor =
          (invoice.type_id === bhConstants.transactionType.CREDIT_NOTE) ?  reversedBackgroundColor : regularBackgroundColor;

        invoice._is_cancelled = (invoice.type_id === bhConstants.transactionType.CREDIT_NOTE);
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
    vm.filters = cache.filters = filters;
    vm.filtersFmt = Invoices.formatFilterParameters(filters);

    // show filter bar as needed
    vm.filterBarHeight = (vm.filtersFmt.length > 0) ?
      { 'height' : 'calc(100vh - 105px)' } : {};
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

    // @TODO work around for not caching patient name
    if (vm.filters && vm.filters.patientUuid) {
      delete vm.filters.patientUuid;
    }

    vm.filtersFmt = Invoices.formatFilterParameters(vm.filters || {});

    load(vm.filters);

    // show filter bar as needed
    vm.filterBarHeight = (vm.filtersFmt.length > 0) ?
      { 'height' : 'calc(100vh - 105px)' } : {};
  }

 //Call the opening of Modal
  function openModal(invoice) {
    Invoices.openCreditNoteModal(invoice)
      .then(function (success) {
        if (success) {
          Notify.success('FORM.INFO.TRANSACTION_REVER_SUCCESS');
          return load();
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
