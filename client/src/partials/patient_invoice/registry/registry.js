angular.module('bhima.controllers')
.controller('InvoiceRegistryController', InvoiceRegistryController);

InvoiceRegistryController.$inject = [
  'PatientInvoiceService', 'NotifyService', 'SessionService', 'util', 'ReceiptModal', 'appcache'
];

/**
 * Invoice Registry Controller
 *
 * This module is responsible for the management of Invoice Registry.
 */
function InvoiceRegistryController(Invoices, Notify, Session, util, Receipt, AppCache) {
  var vm = this;

  var cache = AppCache('InvoiceRegistry');

  var invoiceActionsTemplate =
    '<div class="ui-grid-cell-contents">' +
      '<a href ng-click="grid.appScope.openReceiptModal(row.entity.uuid)">' +
        '<span class="fa fa-file-pdf-o"></span> {{ "TABLE.COLUMNS.RECEIPT" | translate }}' +
      '</a>' +
<<<<<<< 2c3db2b2e212866a1e4d0c123a2a3af8d4a00b1b
      '&nbsp;&nbsp;<a ng-click="grid.appScope.creditNote(row.entity)" class="text-danger">' +
      '<span class="glyphicon glyphicon-remove-sign text-danger"></span> {{ "TABLE.COLUMNS.CREDIT_NOTE" | translate }}</a>' +
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

  // track if module is making a HTTP request for invoices
  vm.loading = false;
  vm.enterprise = Session.enterprise;

  //setting columns names
  vm.uiGridOptions = {
    appScopeProvider : vm,
    enableColumnMenus : false,
    columnDefs : [
      { field : 'reference', displayName : 'TABLE.COLUMNS.REFERENCE', headerCellFilter: 'translate' },
      { field : 'date', cellFilter:'date', displayName : 'TABLE.COLUMNS.BILLING_DATE', headerCellFilter : 'translate' },
      { field : 'patientNames', displayName : 'TABLE.COLUMNS.PATIENT', headerCellFilter : 'translate' },
      { field : 'cost', displayName : 'TABLE.COLUMNS.COST', headerCellFilter : 'translate', cellTemplate: costTemplate },
      { field : 'serviceName', displayName : 'TABLE.COLUMNS.SERVICE', headerCellFilter : 'translate'  },
      { field : 'createdBy', displayName : 'TABLE.COLUMNS.BY', headerCellFilter : 'translate' },
      { name : 'Actions', displayName : '', cellTemplate : invoiceActionsTemplate }
    ],
    enableSorting : true
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
        invoice.date = util.getMomentAge(invoice.date);
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
=======
      '&nbsp;&nbsp;<span ng-if="!row.entity.is_credit_note"><a id="{{row.entity.reference}}" ng-click="!row.entity.is_credit_note ? grid.appScope.creditNote(row.entity) : disabled" class="text-danger">' +
      '<span class="glyphicon glyphicon-remove-sign text-danger"></span> {{ "TABLE.COLUMNS.CREDIT_NOTE" | translate }}</a></span>' +
      '</div>';      

    vm.search = search;
    vm.showBill = showBill;
    vm.momentAge = util.getMomentAge;    
    vm.creditNote = creditNote;

    // track if module is making a HTTP request for invoices
    vm.loading = false;

    //setting columns names
    vm.uiGridOptions = {
      appScopeProvider : vm,
      enableColumnMenus : false,
      columnDefs : [
        { field : 'reference', displayName : 'TABLE.COLUMNS.REFERENCE', headerCellFilter: 'translate' },
        { field : 'date', cellFilter:'date', displayName : 'TABLE.COLUMNS.BILLING_DATE', headerCellFilter : 'translate' },
        { field : 'patientNames', displayName : 'TABLE.COLUMNS.PATIENT', headerCellFilter : 'translate' },
        { field : 'cost', cellFilter:'currency', displayName : 'TABLE.COLUMNS.COST', headerCellFilter : 'translate'  },
        { field : 'serviceName', displayName : 'TABLE.COLUMNS.SERVICE', headerCellFilter : 'translate'  },
        { field : 'createdBy', displayName : 'TABLE.COLUMNS.BY', headerCellFilter : 'translate' },
        { name : 'Actions', displayName : '', cellTemplate : invoiceActionsTemplate }
      ],
      enableSorting : true,
      rowTemplate : '/partials/accounts/templates/grid.creditNote.tmpl.html'
    };

    function handler(error) {
        if(error){
            vm.hasError = true;
            Notify.handleError(error);
        }
    }

    // load Invoice Registry Grid
    function loadGrid() {
        vm.loading = true;
        vm.hasError = false;

        Invoices.read()
            .then(function (invoices) {
                invoices.forEach(function (invoice) {
                  invoice.date = util.getMomentAge(invoice.date);
                });
                vm.uiGridOptions.data = invoices;
            })
            .catch(handler)
            .finally(function () {
                vm.loading = false;
            });
    }

    // Search and filter data in invoices Registry
    function search() {
      vm.loading = true;
      vm.hasError = false;
      Invoices.openSearchModal()
      .then(function (data) {
        var response = data.response;
        vm.filters = data.filters;
        response.forEach(function (invoice) {
          invoice.invoiceAge = util.getMomentAge(invoice.date);
        });
        vm.uiGridOptions.data = response;
      })
      .catch(handler)
      .finally(function () {
        vm.loading = false;
      });
    }

    //show bill function to view the bill
    function showBill (uuid){
      Receipt.invoice(uuid, false)
      .then(function (result) {
      // receipt closed fired
      })
      .catch(function (error) {
      // receipt closed rejected
      });
    }

    //show bill function to view the bill
    function creditNote(invoice){
      vm.loading = true;
      vm.hasError = false;
      Invoices.openCreditNoteModal(invoice)
      .then(function (data) {
        Notify.success('FORM.INFOS.TRANSACTION_REVER_SUCCESS');
        loadGrid();
      })
      .catch(handler)
      .finally(function () {
        vm.loading = false;
>>>>>>> Complete credit note unit
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

  //Function for Credit Note cancel all Invoice
  function creditNote(invoice){
    vm.loading = true;
    vm.hasError = false;
    Invoices.openCreditNoteModal(invoice)
    .then(function (data) {
      var response = data.response;
    })
    .catch(handler)
    .finally(function () {
      vm.loading = false;
    });
  }

  // fire up the module
  startup();

}