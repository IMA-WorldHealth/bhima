angular.module('bhima.controllers')
.controller('VouchersRecordsController', VouchersRecordsController);

// dependencies injection
VouchersRecordsController.$inject = [
  'VoucherService', '$translate', 'NotifyService',
  'JournalFilteringService', 'uiGridGroupingConstants',
  'uiGridConstants', 'ModalService', 'util'
];

/**
 * Vouchers Records Controllers
 * This controller is responsible for display all vouchers made with BHIMA through
 * the simple voucher or complex voucher modules
 */
function VouchersRecordsController(Vouchers, $translate, Notify, Filtering, uiGridGroupingConstants, uiGridConstants, Modal, util) {
  var vm = this;

  /** gobal variables */
  vm.filterEnabled = false;
  vm.gridOptions = {};
  vm.gridApi = {};

  /** paths in the headercrumb */
  vm.bcPaths = [
    { label : 'TREE.ACCOUNTING' },
    { label : 'TREE.VOUCHER_RECORDS' }
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

  // init the filter service
  var filtering  = new Filtering(vm.gridOptions);

  // link to the receipt
  var linkReceiptTemplate = '<div style="padding: 5px;">' +
    '<a href="" ' +
    'ng-if="row.entity.uuid"' +
    'ng-click="grid.appScope.showReceipt(row.entity.uuid)" ' +
    'data-link-receipt="{{ row.entity.uuid }}">' +
    '<i class="fa fa-file-pdf-o"></i> {{ "TABLE.COLUMNS.RECEIPT" | translate }}' +
    '</a></div>';

  // type template
  var transferTypeTemplate = '<div style="padding: 5px;">' +
    '<span ng-class="{\'label label-success\': grid.appScope.getType(row.entity.origin_id).incomeExpense == \'income\', \'label label-warning\': grid.appScope.getType(row.entity.origin_id).incomeExpense == \'expense\'}" href=""> ' +
    '{{ grid.appScope.getType(row.entity.origin_id).text | translate }}' +
    '<span ng-if="row.groupHeader">{{ COL_FIELD }}</span>' +
    '</span>' +
    '<a ng-if="grid.appScope.isDefined(row.entity)" class="label label-default">{{ "FORM.LABELS.UNDEFINED" | translate }}</a>' +
    '</div>';

  // grid default options
  vm.gridOptions.appScopeProvider = vm;
  vm.gridOptions.enableFiltering  = vm.filterEnabled;
  vm.gridOptions.columnDefs       =
    [
      { field : 'reference', displayName : 'TABLE.COLUMNS.REFERENCE', headerCellFilter: 'translate',
        groupingShowAggregationMenu: false
      },
      { field : 'origin_id', displayName : 'TABLE.COLUMNS.TYPE', headerCellFilter: 'translate',
        sort: { priority: 0, direction : 'asc' },
        grouping: { groupPriority: 0},
        cellTemplate: transferTypeTemplate,
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
        cellTemplate: linkReceiptTemplate,
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
    return row.uuid && (row.origin_id === null || row.origin_id === undefined);
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
      // need only one line of the voucher transaction
      vm.gridOptions.data = list.filter(function (item) {
        return item.debit > 0;
      });
    })
    .catch(Notify.errorHandler);
  }

  // print vouchers list
  function printList() {
    var dateFrom = vm.dateInterval ? util.htmlDate(vm.dateInterval.dateFrom) : null;
    var dateTo = vm.dateInterval ? util.htmlDate(vm.dateInterval.dateTo) : null;
    var url = '/vouchers/reports?dateFrom=' + dateFrom + '&dateTo=' + dateTo;
    Modal.openReports({ url: url, renderer: 'pdf' });
  }

  // showReceipt
  function showReceipt(uuid) {
    var url = '/vouchers/receipts/' + uuid;
    Modal.openReports({ url: url, renderer: 'pdf' });
  }

  // initialize module
  function startup() {
    Vouchers.read()
    .then(function (list) {
      // need only one line of the voucher transaction
      vm.gridOptions.data = list.filter(function (item) {
        return item.debit > 0;
      });
    })
    .catch(Notify.errorHandler);
  }

}
