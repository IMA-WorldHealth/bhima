angular.module('bhima.controllers')
.controller('VoucherController', VoucherController);

// dependencies injection
VoucherController.$inject = [
  'VoucherService', '$translate', 'NotifyService',
  'GridFilteringService', 'uiGridGroupingConstants',
  'uiGridConstants', 'ModalService', 'DateService',
  'LanguageService', 'bhConstants'
];

/**
 * Vouchers Records Controllers
 *
 * @description
 * This controller is responsible for display all vouchers which are in the
 * voucher table.
 */
function VoucherController(Vouchers, $translate, Notify, Filtering, uiGridGroupingConstants, uiGridConstants, Modal, Dates, Languages, bhConstants) {
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
    { icon: 'fa fa-filter', label: $translate.instant('FORM.BUTTONS.FILTER'),
      action: toggleFilter, color: 'btn-default'
    },
    { icon: 'fa fa-search', label: $translate.instant('FORM.LABELS.SEARCH'),
      action: search, color: 'btn-default'
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
  vm.gridOptions.enableFiltering  = vm.filterEnabled;
  vm.gridOptions.columnDefs       = [
    { field : 'reference', displayName : 'TABLE.COLUMNS.REFERENCE', headerCellFilter: 'translate',
      groupingShowAggregationMenu: false
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
    vm.bcButtons[0].color = vm.filterEnabled ? 'btn-default active' : 'btn-default';
    vm.gridOptions.enableFiltering = vm.filterEnabled;
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.ALL);
  }

  // search voucher
  function search() {
    Modal.openDateInterval()
    .then(function (dateInterval) {
      vm.dateInterval = dateInterval;
      return Vouchers.read(null, vm.dateInterval);
    })
    .then(function (list) {
      vm.gridOptions.data = list;
    })
    .catch(Notify.errorHandler);
  }

  // showReceipt
  function showReceipt(uuid) {
    var url = '/reports/finance/vouchers/' + uuid;
    var params = { renderer: 'pdf', lang: Languages.key };
    Modal.openReports({ url: url, params: params });
  }

  // initialize module
  function startup() {
    Vouchers.transactionType()
    .then(function (result) {
      vm.transactionTypes = result;
    })
    .catch(Notify.errorHandler);

    vm.loading = true;
    Vouchers.read()
    .then(function (list) {
      vm.gridOptions.data = list;
    })
    .catch(function (error) {
      vm.hasError = true;
      Notify.errorHandler(error);
    })
    .finally(toggleLoadingIndicator);

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

  }
}
