angular.module('bhima.controllers')
  .controller('VoucherController', VoucherController);

// dependencies injection
VoucherController.$inject = [
  'VoucherService', '$translate', 'NotifyService', 'GridFilteringService',
  'uiGridGroupingConstants', 'uiGridConstants', 'ModalService', 'DateService',
  'bhConstants', 'ReceiptModal'
];

/**
 * Vouchers Registry Controller
 *
 * @description
 * This controller is responsible for display all vouchers in the voucher table.
 */
function VoucherController(Vouchers, $translate, Notify, Filtering, uiGridGroupingConstants, uiGridConstants, Modal, Dates, bhConstants, Receipts) {
  var vm = this;

  /* global variables */
  vm.filterEnabled = false;
  vm.transactionTypes = {};
  vm.gridOptions = {};
  vm.gridApi = {};

  /* paths in the headercrumb */
  vm.bcPaths = [
    { label : 'TREE.FINANCE' },
    { label : 'TREE.VOUCHER_REGISTRY' }
  ];

  /** buttons in the headercrumb */
  vm.bcButtons = [
    { icon: 'fa fa-search', label: $translate.instant('FORM.LABELS.SEARCH'),
      action: search, color: 'btn-default'
    },
    { icon: 'fa fa-filter', color: 'btn-default',
      action: toggleFilter, 
    }
  ];

  /** button Print */
  vm.buttonPrint = { pdfUrl: '/reports/finance/vouchers' };


  /** search filters */
  vm.searchFilter = [
    { displayName: 'FORM.LABELS.DATE_FROM', values: vm.dateInterval ? vm.dateInterval.dateFrom : null, filter: 'moment' },
    { displayName: 'FORM.LABELS.DATE_TO', values: vm.dateInterval ? vm.dateInterval.dateTo : null ,filter: 'moment'},
  ];

  // init the filter service
  var filtering  = new Filtering(vm.gridOptions);

  // grid default options
  vm.gridOptions.appScopeProvider = vm;
  vm.gridOptions.showColumnFooter  = true;
  vm.gridOptions.enableFiltering  = vm.filterEnabled;
  vm.gridOptions.columnDefs       = [
    { field : 'reference', displayName : 'TABLE.COLUMNS.REFERENCE', headerCellFilter: 'translate',
      groupingShowAggregationMenu: false,
      aggregationType: uiGridConstants.aggregationTypes.count
    },
    { field : 'type_id', displayName : 'TABLE.COLUMNS.TYPE', headerCellFilter: 'translate',
      sort: { priority: 0, direction : 'asc' },
      grouping: { groupPriority: 0},
      cellTemplate: 'partials/templates/grid/voucherType.tmpl.html',
      treeAggregationType: uiGridGroupingConstants.aggregation.SUM,
      customTreeAggregationFinalizerFn: typeAggregation,
      groupingShowAggregationMenu: false
    },
    { field : 'date', displayName : 'TABLE.COLUMNS.DATE', headerCellFilter: 'translate',
      cellFilter : 'date:"mediumDate"',
      filter : { condition : filtering.byDate },
      customTreeAggregationFinalizerFn: timeAggregation,
      groupingShowAggregationMenu: false
    },
    { field : 'description', displayName : 'TABLE.COLUMNS.DESCRIPTION', headerCellFilter: 'translate',
      groupingShowAggregationMenu: false
    },
    { field : 'amount', displayName : 'TABLE.COLUMNS.AMOUNT', headerCellFilter: 'translate',
      treeAggregationType: uiGridGroupingConstants.aggregation.SUM,
      groupingShowAggregationMenu: false
    },
    { field : 'display_name', displayName : 'TABLE.COLUMNS.RESPONSIBLE', headerCellFilter: 'translate',
      groupingShowAggregationMenu: false
    },
    { field : 'action', displayName : '...',
      cellTemplate: 'partials/templates/grid/linkFilePDF.tmpl.html',
      enableFiltering: false,
      enableColumnMenu: false
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
    vm.gridApi.grid.registerDataChangeCallback(expandAllRows);
  }

  // expand all rows
  function expandAllRows() {
    vm.gridApi.treeBase.expandAllRows();
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
    vm.filterEnabled = !vm.filterEnabled;
    vm.bcButtons[1].color = vm.filterEnabled ? 'btn-default active' : 'btn-default';
    vm.gridOptions.enableFiltering = vm.filterEnabled;
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.ALL);
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
      .then(function (list) {
        vm.gridOptions.data = list;
      })
      .catch(function (err) {
        if (err && !err.code) { return; }
        Notify.handleError(err);
      })
      .finally(function () {
        vm.loading = false;
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
    .then(function (result) {
      vm.transactionTypes = result;
    })
    .catch(Notify.handleError);

    Vouchers.read()
      .then(function (list) {
        vm.gridOptions.data = list;
      })
      .catch(errorHandler)
      .finally(toggleLoadingIndicator);
  }
}
