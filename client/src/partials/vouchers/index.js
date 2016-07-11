angular.module('bhima.controllers')
.controller('VoucherController', VoucherController);

// dependencies injection
VoucherController.$inject = [
  'VoucherService', '$translate', 'NotifyService',
  'JournalFilteringService', 'uiGridGroupingConstants',
  'uiGridConstants', 'ModalService', 'DateService', 'LanguageService'
];

/**
 * Vouchers Records Controllers
 * This controller is responsible for display all vouchers
 * which are in the voucher table
 */
function VoucherController(Vouchers, $translate, Notify, Filtering, uiGridGroupingConstants, uiGridConstants, Modal, Dates, Languages) {
  var vm = this;

  /** gobal variables */
  vm.filterEnabled = false;
  vm.gridOptions = {};
  vm.gridApi = {};

  /** paths in the headercrumb */
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
    },
    { icon: 'fa fa-print', label: $translate.instant('FORM.LABELS.PRINT'),
      action: printList, color: 'btn-default'
    }
  ];

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
  vm.gridOptions.columnDefs       =
    [
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
      { field : 'user', displayName : 'TABLE.COLUMNS.RESPONSIBLE', headerCellFilter: 'translate',
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
  vm.getType = getType;
  vm.isDefined = isDefined;
  vm.showReceipt = showReceipt;

  // startup
  startup();

  // API register function
  function onRegisterApi(gridApi) {
    vm.gridApi = gridApi;
  }

  // Grid Aggregation
  function typeAggregation(aggregation) {
    var type = getType(aggregation.groupVal);
    aggregation.rendered = type ? $translate.instant(type.text) : $translate.instant('FORM.LABELS.UNDEFINED');
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

  // get vouchers type
  function getType(originId) {
    if (originId === null || originId === undefined) { return {}; }

    return Vouchers.transferType.filter(function (item) {
      return item.id === originId;
    })[0];
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

  // print vouchers list
  function printList() {
    var dateFrom = vm.dateInterval ? vm.dateInterval.dateFrom: null;
    var dateTo = vm.dateInterval ? vm.dateInterval.dateTo : null;
    var url = '/vouchers/reports';
    var params = { dateFrom: dateFrom, dateTo: dateTo, renderer: 'pdf', lang: Languages.key };
    Modal.openReports({ url: url, params: params });
  }

  // showReceipt
  function showReceipt(uuid) {
    var url = '/vouchers/receipts/' + uuid;
    var params = { renderer: 'pdf', lang: Languages.key };
    Modal.openReports({ url: url, params: params });
  }

  // initialize module
  function startup() {
    Vouchers.read()
    .then(function (list) {
      vm.gridOptions.data = list;
    })
    .catch(Notify.errorHandler);
  }

}
