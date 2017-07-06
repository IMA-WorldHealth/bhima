angular.module('bhima.controllers')
  .controller('InvoiceRegistryController', InvoiceRegistryController);

InvoiceRegistryController.$inject = [
  'PatientInvoiceService', 'bhConstants', 'NotifyService', 'SessionService',
  'ReceiptModal', 'uiGridConstants', 'ModalService', 'CashService',
  'GridSortingService', 'GridColumnService', 'GridStateService', '$state',
];

/**
 * Invoice Registry Controller
 *
 * @description This module is responsible for the management of Invoice Registry.
 */
function InvoiceRegistryController(
  Invoices, bhConstants, Notify, Session, Receipt, uiGridConstants,
  ModalService, Cash, Sorting, Columns, GridState, $state
) {
  var vm = this;

  // Background color for make the difference between the valid and cancel invoice
  var reversedBackgroundColor = { 'background-color' : '#ffb3b3' };
  var regularBackgroundColor = { 'background-color' : 'none' };
  var cacheKey = 'invoice-grid';

  var columnDefs;
  var gridColumns;
  var state;

  vm.search = search;
  vm.openReceiptModal = Receipt.invoice;
  vm.creditNoteReceipt = Receipt.creditNote;
  vm.onRemoveFilter = onRemoveFilter;
  vm.creditNote = creditNote;
  vm.bhConstants = bhConstants;
  vm.download = Invoices.download;

  // track if module is making a HTTP request for invoices
  vm.loading = false;
  vm.enterprise = Session.enterprise;

  columnDefs = [{
    field : 'reference',
    displayName : 'TABLE.COLUMNS.REFERENCE',
    headerCellFilter : 'translate',
    aggregationType : uiGridConstants.aggregationTypes.count,
    aggregationHideLabel : true,
    footerCellClass : 'text-center',
    cellTemplate : '/modules/invoices/registry/templates/reference.html',
    sortingAlgorithm : Sorting.algorithms.sortByReference,
  }, {
    field : 'date',
    cellFilter : 'date',
    displayName : 'TABLE.COLUMNS.BILLING_DATE',
    headerCellFilter : 'translate',
    type : 'date',
  }, {
    name : 'patientName',
    displayName : 'TABLE.COLUMNS.PATIENT',
    headerCellFilter : 'translate',
  }, {
    field : 'cost',
    displayName : 'TABLE.COLUMNS.COST',
    headerCellFilter : 'translate',
    cellFilter : 'currency:'.concat(Session.enterprise.currency_id),
    aggregationType : uiGridConstants.aggregationTypes.sum,
    aggregationHideLabel : true,
    footerCellClass : 'text-right',
    type : 'number',
    footerCellFilter : 'currency:'.concat(Session.enterprise.currency_id),
  }, {
    field : 'serviceName',
    displayName : 'TABLE.COLUMNS.SERVICE',
    headerCellFilter : 'translate',
  }, {
    field : 'display_name',
    displayName : 'TABLE.COLUMNS.BY',
    headerCellFilter : 'translate',
  }, {
    name : 'credit_action',
    displayName : '',
    cellTemplate : '/modules/invoices/registry/templates/action.cell.html',
    enableSorting : false,
  }];

  // setting columns names
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

  gridColumns = new Columns(vm.uiGridOptions, cacheKey);
  state = new GridState(vm.uiGridOptions, cacheKey);

  function handler(error) {
    vm.hasError = true;
    Notify.handleError(error);
  }

  function toggleLoadingIndicator() {
    vm.loading = !vm.loading;
  }

  // this function loads invoices from the database with search parameters
  // if passed in.
  function load(filters) {
    var request;

    // flush error and loading states
    vm.hasError = false;
    toggleLoadingIndicator();

    // if we have search parameters and read invoices.
    request = Invoices.read(null, filters);

    // hook the returned patients up to the grid.
    request.then(function (invoices) {
      invoices.forEach(function (invoice) {
        invoice._backgroundColor = invoice.reversed ? reversedBackgroundColor : regularBackgroundColor;
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
    var filtersSnapshot = Invoices.filters.formatHTTP();

    Invoices.openSearchModal(filtersSnapshot)
      .then(function (changes) {
        Invoices.filters.replaceFilters(changes);

        Invoices.cacheFilters();
        vm.latestViewFilters = Invoices.filters.formatView();

        return load(Invoices.filters.formatHTTP(true));
      });
  }

  // remove a filter with from the filter object, save the filters and reload
  function onRemoveFilter(key) {
    Invoices.removeFilter(key);
    Invoices.cacheFilters();
    vm.latestViewFilters = Invoices.filters.formatView();
    return load(Invoices.filters.formatHTTP(true));
  }

  // startup function. Checks for cached filters and loads them.  This behavior could be changed.
  function startup() {
    if ($state.params.filters) {
      // Fix me, generate change dynamically 
      var change = [{ key : $state.params.filters.key, value : $state.params.filters.value }];
      
      Invoices.filters.replaceFilters(change);
      Invoices.cacheFilters();
    }

    load(Invoices.filters.formatHTTP(true));
    vm.latestViewFilters = Invoices.filters.formatView();
  }

  // This function opens a modal through column service to let the user toggle
  // the visibility of the invoice registry's columns.
  vm.openColumnConfigModal = function openColumnConfigModal() {
    // column configuration has direct access to the grid API to alter the current
    // state of the columns - this will be saved if the user saves the grid configuration
    gridColumns.openConfigurationModal();
  };

  // saves the grid's current configuration
  vm.saveGridState = state.saveGridState;
  vm.clearGridState = function clearGridState() {
    state.clearGridState();
    $state.reload();
  };

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
