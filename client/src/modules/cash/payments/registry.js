angular.module('bhima.controllers')
  .controller('CashPaymentRegistryController', CashPaymentRegistryController);

// dependencies injection
CashPaymentRegistryController.$inject = [
  'CashService', 'bhConstants', 'NotifyService', 'SessionService', 'uiGridConstants',
  'uiGridGroupingConstants', 'LanguageService', 'appcache', 'ReceiptModal', 'ModalService',
  'GridSortingService', '$state', 'FilterService',
];

/**
 * Cash Payment Registry Controller
 *
 * This controller is responsible to display all cash payment made and provides
 * print and search utilities for the registry.`j
 */
function CashPaymentRegistryController(
  Cash, bhConstants, Notify, Session, uiGridConstants, uiGridGroupingConstants, Languages,
  AppCache, Receipt, Modal, Sorting, $state, Filters
) {
  var vm = this;

  // Background color for make the difference between the valid and cancel paiement
  var reversedBackgroundColor = { 'background-color' : '#ffb3b3' };
  var regularBackgroundColor = { 'background-color' : 'none' };

  var filter = new Filters();
  vm.filter = filter;

  // global variables
  // vm.filters = { lang: Languages.key };
  vm.filtersFmt = [];
  vm.gridOptions = {};
  vm.enterprise = Session.enterprise;
  vm.bhConstants = bhConstants;

  // bind the cash payments receipt
  vm.openReceiptModal = Receipt.cash;

  // expose to the view
  vm.search = search;
  vm.onRemoveFilter = onRemoveFilter;
  vm.cancelCash = cancelCash;

  // grid default options
  vm.gridOptions = {
    appScopeProvider  : vm,
    showColumnFooter  : true,
    enableColumnMenus : false,
    flatEntityAccess  : true,
    fastWatch         : true,
    enableFiltering   : vm.filterEnabled,
    rowTemplate       : '/modules/cash/payments/templates/grid.canceled.tmpl.html',
  };

  vm.gridOptions.columnDefs = [{
    field : 'reference',
    displayName : 'TABLE.COLUMNS.REFERENCE',
    headerCellFilter : 'translate',
    aggregationType : uiGridConstants.aggregationTypes.count,
    aggregationHideLabel : true,
    sortingAlgorithm : Sorting.algorithms.sortByReference,
    cellTemplate : '/modules/cash/payments/templates/reference.html',
  }, {
    field : 'date',
    displayName : 'TABLE.COLUMNS.DATE',
    headerCellFilter : 'translate',
    cellFilter : 'date:"mediumDate"',
  }, {
    name : 'patientName',
    displayName : 'TABLE.COLUMNS.CLIENT',
    headerCellFilter : 'translate',
  }, {
    field : 'description',
    displayName : 'TABLE.COLUMNS.DESCRIPTION',
    headerCellFilter : 'translate',
  }, {
    field : 'amount',
    displayName : 'TABLE.COLUMNS.AMOUNT',
    headerCellFilter : 'translate',
    cellTemplate : 'modules/cash/payments/templates/amount.grid.html',
    type : 'number',

    // @TODO(jniles): This is temporary, as it doesn't take into account USD payments
    aggregationType : uiGridConstants.aggregationTypes.sum,
    aggregationHideLabel : true,
    footerCellFilter : 'currency:'.concat(Session.enterprise.currency_id),
  }, {
    field : 'cashbox_label',
    displayName : 'TABLE.COLUMNS.CASHBOX',
    headerCellFilter : 'translate',
  }, {
    field : 'display_name',
    displayName : 'TABLE.COLUMNS.USER',
    headerCellFilter : 'translate',
  }, {
    field : 'action',
    displayName : '',
    enableFiltering : false,
    enableSorting : false,
    cellTemplate : 'modules/cash/payments/templates/action.cell.html',
  }];

  function handleError(error) {
    vm.hasError = true;
    Notify.handleError(error);
  }

  function search() {
    var filtersSnapshot = Cash.filters.formatHTTP();

    Modal.openSearchCashPayment(filtersSnapshot)
      .then(function (changes) {
        Cash.filters.replaceFilters(changes);

        Cash.cacheFilters();
        vm.latestViewFilters = Cash.filters.formatView();

        return load(Cash.filters.formatHTTP(true));
      })
      .catch(angular.noop);
  }

  // remove a filter with from the filter object, save the filters and reload
  function onRemoveFilter(key) {
    Cash.removeFilter(key);

    Cash.cacheFilters();
    vm.latestViewFilters = Cash.filters.formatView();

    return load(Cash.filters.formatHTTP(true));
  }

  // load cash
  function load(filters) {
    vm.hasError = false;
    toggleLoadingIndicator();

    var request = Cash.read(null, filters);
    
    request.then(function (rows) {
        rows.forEach(function (row) {
          var hasCreditNote = row.reversed;
          row._backgroundColor = hasCreditNote ? reversedBackgroundColor : regularBackgroundColor;
          row._hasCreditNote = hasCreditNote;
        });

        vm.gridOptions.data = rows;
      })
      .catch(handleError)
      .finally(function () {
        toggleLoadingIndicator();
      });
  }

 // Function for Cancel Cash cancel all Invoice
  function cancelCash(invoice) {
    Cash.openCancelCashModal(invoice)
      .then(function (success) {
        if (!success) { return; }
        Notify.success('FORM.INFO.TRANSACTION_REVER_SUCCESS');
        load(Cash.Filters.formatHTTP(true));
      });
  }

  function toggleLoadingIndicator() {
    vm.loading = !vm.loading;
  }

  function startup() {
    load(Cash.filters.formatHTTP(true));
    vm.latestViewFilters = Cash.filters.formatView();
  }

  startup();
}
