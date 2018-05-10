angular.module('bhima.controllers')
  .controller('CashPaymentRegistryController', CashPaymentRegistryController);

// dependencies injection
CashPaymentRegistryController.$inject = [
  'CashService', 'bhConstants', 'NotifyService', 'SessionService', 'uiGridConstants',
  'ModalService', 'GridSortingService', '$state', 'FilterService',
  'GridColumnService', 'GridStateService', 'ModalService', 'util',
];

/**
 * Cash Payment Registry Controller
 *
 * This controller is responsible to display all cash payment made and provides
 * print and search utilities for the registry.`j
 */
function CashPaymentRegistryController(
  Cash, bhConstants, Notify, Session, uiGridConstants, Modal, Sorting, $state,
  Filters, Columns, GridState, Modals, util
) {
  var vm = this;

  // background color for make the difference between the valid and canceled payment
  var reversedBackgroundColor = { 'background-color' : '#ffb3b3' };
  var regularBackgroundColor = { 'background-color' : 'none' };
  var cacheKey = 'payment-grid';

  var gridColumns;
  var columnDefs;
  var state;
  var filter = new Filters();

  vm.filter = filter;
  vm.format = util.formatDate;
  // global variables
  vm.enterprise = Session.enterprise;
  vm.bhConstants = bhConstants;

  // expose to the view
  vm.search = search;
  vm.onRemoveFilter = onRemoveFilter;
  vm.cancelCash = cancelCash;
  vm.openColumnConfigModal = openColumnConfigModal;
  vm.clearGridState = clearGridState;
  vm.deleteCashPayment = deleteCashPaymentWithConfirmation;
  vm.download = Cash.download;

  vm.allowsRecordDeletion = allowsRecordDeletion;

  columnDefs = [{
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
    cellTemplate : '/modules/cash/payments/templates/date.cell.html',
    type : 'date',
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
    footerCellClass : 'text-right',
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

  // grid default options
  vm.gridOptions = {
    appScopeProvider  : vm,
    showColumnFooter  : true,
    enableColumnMenus : false,
    flatEntityAccess  : true,
    fastWatch         : true,
    columnDefs,
    rowTemplate       : '/modules/cash/payments/templates/grid.canceled.tmpl.html',
  };

  gridColumns = new Columns(vm.gridOptions, cacheKey);
  state = new GridState(vm.gridOptions, cacheKey);

  // saves the grid's current configuration
  vm.saveGridState = state.saveGridState;
  function clearGridState() {
    state.clearGridState();
    $state.reload();
  }

  function handleError(error) {
    vm.hasError = true;
    Notify.handleError(error);
  }

  function search() {
    const filtersSnapshot = Cash.filters.formatHTTP();

    Modal.openSearchCashPayment(filtersSnapshot)
      .then((changes) => {
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
    const request = Cash.read(null, filters);

    vm.hasError = false;
    toggleLoadingIndicator();

    request
      .then((rows) => {
        rows.forEach((row) => {
          const hasCreditNote = row.reversed;
          row._backgroundColor = hasCreditNote ? reversedBackgroundColor : regularBackgroundColor;
          row._hasCreditNote = hasCreditNote;
        });

        vm.gridOptions.data = rows;
      })
      .catch(handleError)
      .finally(toggleLoadingIndicator);
  }

  // Function for Cancel Cash cancel all Invoice
  function cancelCash(invoice) {
    Cash.openCancelCashModal(invoice)
      .then((success) => {
        if (!success) { return; }
        Notify.success('FORM.INFO.TRANSACTION_REVER_SUCCESS');
        load(Cash.Filters.formatHTTP(true));
      });
  }

  function toggleLoadingIndicator() {
    vm.loading = !vm.loading;
  }

  function startup() {
    if ($state.params.filters.length) {
      Cash.filters.replaceFiltersFromState($state.params.filters);
      Cash.cacheFilters();
    }

    vm.latestViewFilters = Cash.filters.formatView();

    load(Cash.filters.formatHTTP(true));
    vm.latestViewFilters = Cash.filters.formatView();
  }

  // This function opens a modal through column service to let the user toggle
  // the visibility of the cash registry's columns.
  function openColumnConfigModal() {
    gridColumns.openConfigurationModal();
  }

  function remove(entity) {
    Cash.remove(entity.uuid)
      .then(() => {
        Notify.success('FORM.INFO.DELETE_RECORD_SUCCESS');

        // load() has it's own error handling.  The absence of return below is
        // explicit.
        load(Cash.filters.formatHTTP(true));
      })
      .catch(Notify.handleError);
  }

  // this function deletes the cash payment and associated transactions from
  // the database
  function deleteCashPaymentWithConfirmation(entity) {
    Modals.confirm('FORM.DIALOGS.CONFIRM_DELETE')
      .then((isOk) => {
        if (isOk) { remove(entity); }
      });
  }

  function allowsRecordDeletion() {
    return Session.enterprise.settings.enable_delete_records;
  }

  startup();
}
