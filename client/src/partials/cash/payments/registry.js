angular.module('bhima.controllers')
  .controller('CashPaymentRegistryController', CashPaymentRegistryController);

// dependencies injection
CashPaymentRegistryController.$inject = [
  'CashService', 'bhConstants', 'NotifyService', 'SessionService', 'uiGridConstants',
  'uiGridGroupingConstants', 'LanguageService', 'appcache', 'ReceiptModal', 'ModalService',
  'GridSortingService'
];

/**
 * Cash Payment Registry Controller
 *
 * This controller is responsible to display all cash payment made and provides
 * print and search utilities for the registry.`j
 */
function CashPaymentRegistryController(Cash, bhConstants, Notify, Session, uiGridConstants, uiGridGroupingConstants, Languages, AppCache, Receipt, Modal, Sorting) {
  var vm = this;

  var cache = AppCache('CashRegistry');

  // Background color for make the difference between the valid and cancel paiement
  var reversedBackgroundColor = { 'background-color': '#ffb3b3' };
  var regularBackgroundColor = { 'background-color': 'none' };

  // global variables
  vm.filters = { lang: Languages.key };
  vm.formatedFilters = [];
  vm.gridOptions = {};
  vm.enterprise = Session.enterprise;
  vm.bhConstants = bhConstants;

  // bind the cash payments receipt
  vm.openReceiptModal = Receipt.cash;

  // expose to the view
  vm.search = search;
  vm.onRemoveFilter = onRemoveFilter;
  vm.clearFilters = clearFilters;
  vm.cancelCash = cancelCash;

  // grid default options
  vm.gridOptions = {
    appScopeProvider : vm,
    showColumnFooter : true,
    enableColumnMenus : false,
    flatEntityAccess : true,
    fastWatch : true,
    enableFiltering : vm.filterEnabled,
    rowTemplate : '/partials/cash/payments/templates/grid.canceled.tmpl.html'
  };

  vm.gridOptions.columnDefs = [{
    field : 'reference', displayName : 'TABLE.COLUMNS.REFERENCE',
    headerCellFilter: 'translate', aggregationType: uiGridConstants.aggregationTypes.count,
    aggregationHideLabel : true, sortingAlgorithm : Sorting.algorithms.sortByReference
  }, {
    field : 'date', displayName : 'TABLE.COLUMNS.DATE', headerCellFilter: 'translate', cellFilter : 'date:"mediumDate"',
  }, {
    field : 'patientName', displayName : 'TABLE.COLUMNS.CLIENT', headerCellFilter: 'translate'
  }, {
    field : 'description', displayName : 'TABLE.COLUMNS.DESCRIPTION', headerCellFilter: 'translate'
  }, {
    field : 'amount', displayName : 'TABLE.COLUMNS.AMOUNT', headerCellFilter: 'translate',
    cellTemplate : 'partials/cash/payments/templates/amount.grid.html', type: 'number',

    // @TODO(jniles): This is temporary, as it doesn't take into account USD payments
    aggregationType: uiGridConstants.aggregationTypes.sum, aggregationHideLabel : true,
    footerCellFilter: 'currency:' + Session.enterprise.currency_id
  }, {
    field : 'cashbox_label', displayName : 'TABLE.COLUMNS.CASHBOX', headerCellFilter: 'translate'
  }, {
    field : 'display_name', displayName : 'TABLE.COLUMNS.USER', headerCellFilter: 'translate'
  }, {
    field : 'action', displayName : '', enableFiltering: false, enableSorting: false,
    cellTemplate: 'partials/cash/payments/templates/action.cell.html'
  }];

  function handleError(error) {
    vm.hasError = true;
    Notify.handleError(error);
  }

  // search
  function search() {
    Modal.openSearchCashPayment()
      .then(function (filters) {
        if (!filters) { return; }
        reload(filters);
      });
  }

  // on remove one filter
  function onRemoveFilter(key) {
    delete vm.filters.identifiers[key];
    delete vm.filters.display[key];
    reload(vm.filters);
  }

  // remove a filter with from the filter object, save the filters and reload
  function clearFilters() {
    reload({ display : [], identifiers : {} });
  }

  // reload with filter
  function reload(filters) {
    vm.filters = filters;
    vm.formatedFilters = Cash.formatFilterParameters(filters.display);
    load(filters.identifiers);
  }

  // load cash
  function load(filters) {
    vm.hasError = false;

    toggleLoadingIndicator();

    Cash.search(filters)
      .then(function (rows) {
        rows.forEach(function (row) {
          var hasCreditNote = (row.type_id === bhConstants.transactionType.CREDIT_NOTE);
          row._backgroundColor = hasCreditNote ? reversedBackgroundColor : regularBackgroundColor;
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
        load();
      });
  }

  function toggleLoadingIndicator() {
    vm.loading = !vm.loading;
  }

  // startup
  load();
}
