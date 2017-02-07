angular.module('bhima.controllers')
  .controller('VoucherController', VoucherController);

// dependencies injection
VoucherController.$inject = [
  'VoucherService', '$translate', 'NotifyService', 'GridFilteringService',
  'uiGridGroupingConstants', 'uiGridConstants', 'ModalService', 'DateService',
  'bhConstants', 'ReceiptModal', 'GridSortingService'
];

/**
 * Vouchers Registry Controller
 *
 * @description
 * This controller is responsible for display all vouchers in the voucher table.
 */
function VoucherController(Vouchers, $translate, Notify, Filtering, uiGridGroupingConstants, uiGridConstants, Modal, Dates, bhConstants, Receipts, Sorting) {
  var vm = this;

  /* global variables */
  vm.filterEnabled = false;
  vm.transactionTypes = {};
  vm.gridApi = {};
  vm.gridOptions = {};
  vm.search = search;
  vm.toggleFilter = toggleFilter;

  var FILTER_BAR_HEIGHT = bhConstants.grid.FILTER_BAR_HEIGHT;

  /** search filters */
  vm.searchFilter = [
    { displayName: 'FORM.LABELS.DATE_FROM', values: vm.dateInterval ? vm.dateInterval.dateFrom : null, filter: 'moment' },
    { displayName: 'FORM.LABELS.DATE_TO', values: vm.dateInterval ? vm.dateInterval.dateTo : null, filter: 'moment'},
  ];

  // init the filter service
  var filtering  = new Filtering(vm.gridOptions);

  vm.gridOptions = {
    appScopeProvider : vm,
    showColumnFooter : true,
    enableFiltering : vm.filterEnabled,
    rowTemplate: '/partials/templates/grid/voucher.row.html'
  };

  // grid default options
  vm.gridOptions.columnDefs = [
    { field : 'reference', displayName : 'TABLE.COLUMNS.REFERENCE', headerCellFilter: 'translate',
      treeAggregationType: uiGridGroupingConstants.aggregation.COUNT,
      sortingAlgorithm : Sorting.algorithms.sortByReference,
      treeAggregationLabel: '', footerCellClass : 'text-center',
    },
    { field : 'type_id', displayName : 'TABLE.COLUMNS.TYPE', headerCellFilter: 'translate',
      sort: { priority: 0, direction : 'asc' },
      cellTemplate: 'partials/templates/grid/voucherType.tmpl.html',
      treeAggregationType: uiGridGroupingConstants.aggregation.SUM,
      customTreeAggregationFinalizerFn: typeAggregation,
      treeAggregationLabel : '',
      groupingShowAggregationMenu: false
    },
    { field : 'date', displayName : 'TABLE.COLUMNS.DATE', headerCellFilter: 'translate',
      cellFilter : 'date',
      filter : { condition : filtering.byDate },
      customTreeAggregationFinalizerFn: timeAggregation,
      treeAggregationLabel : '', type : 'date',
      groupingShowAggregationMenu: false
    },
    { field : 'description', displayName : 'TABLE.COLUMNS.DESCRIPTION', headerCellFilter: 'translate',
      groupingShowAggregationMenu: false
    },
    { field : 'amount', displayName : 'TABLE.COLUMNS.AMOUNT', headerCellFilter: 'translate',
      treeAggregationType: uiGridGroupingConstants.aggregation.SUM,
      treeAggregationLabel : '', footerCellClass : 'text-center',
      type: 'number', groupingShowAggregationMenu: false
    },
    { field : 'display_name', displayName : 'TABLE.COLUMNS.RESPONSIBLE', headerCellFilter: 'translate',
      groupingShowAggregationMenu: false
    },
    { field : 'action', displayName : '...', enableFiltering: false, enableColumnMenu: false,
      enableSorting: false, cellTemplate: 'partials/vouchers/templates/action.cell.html'
    }
  ];

  // register API
  vm.gridOptions.onRegisterApi = onRegisterApi;

  // expose function
  vm.get = get;
  vm.isDefined = isDefined;
  vm.showReceipt = showReceipt;
  vm.bhConstants = bhConstants;

  // startup
  startup();

  // API register function
  function onRegisterApi(gridApi) {
    vm.gridApi = gridApi;
  }

  // Grid Aggregation
  function typeAggregation(aggregation) {
    var type = get(aggregation.groupVal);
    aggregation.rendered = $translate.instant(type ? type.text : 'FORM.LABELS.UNDEFINED');
  }

  // Time Aggregation
  function timeAggregation(aggregation) {
    var date = new Date(aggregation.groupVal);
    var time = date.getHours() + ':' + date.getMinutes();
    aggregation.rendered = aggregation.groupVal ? date.toDateString().concat('  (', time, ')') : null;
  }

  // isDefined Type
  function isDefined(row) {
    return row.uuid && (row.type_id === null || row.type_id === undefined);
  }

  // get vouchers transaction
  function get(originId) {
    if (originId === null || originId === undefined) { return {}; }
    return vm.transactionTypes.get(originId);
  }

  // enable filter
  function toggleFilter() {
    vm.gridOptions.enableFiltering = vm.filterEnabled = !vm.filterEnabled;
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
  }

  // search voucher
  function search() {
    vm.hasError = false;

    Modal.openDateInterval()
      .then(function (dateInterval) {
        vm.dateInterval = dateInterval;

        toggleLoadingIndicator();
        return Vouchers.read(null, vm.dateInterval);
      })
      .then(function (vouchers) {
        vm.gridOptions.data = vouchers;
        vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.ALL);
      })
      .catch(function (err) {
        if (err && !err.code) { return; }
        Notify.handleError(err);
      })
      .finally(function () {
        toggleLoadingIndicator();
        vm.filterBarHeight = (vm.dateInterval) ? FILTER_BAR_HEIGHT : {};
      });
  }

  // showReceipt
  function showReceipt(uuid) {
    Receipts.voucher(uuid);
  }

  /**
   * @function errorHandler
   *
   * @description
   * Uses Notify to show an error in case the server sends back an information.
   * Triggers the error state on the grid.
   */
  function errorHandler(error) {
    vm.hasError = true;
    Notify.handleError(error);
  }

  /**
   * @function toggleLoadingIndicator
   *
   * @description
   * Toggles the grid's loading indicator to eliminate the flash when rendering
   * transactions and allow a better UX for slow loads.
   */
  function toggleLoadingIndicator() {
    vm.loading = !vm.loading;
  }

  // initialize module
  function startup() {
    vm.hasError = false;
    toggleLoadingIndicator();

    Vouchers.transactionType()
      .then(function (store) {
        vm.transactionTypes = store;
      })
      .catch(Notify.handleError);

    Vouchers.read()
      .then(function (vouchers) {
        vm.gridOptions.data = vouchers;
      })
      .catch(errorHandler)
      .finally(toggleLoadingIndicator);
  }
}
