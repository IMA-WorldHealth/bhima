angular.module('bhima.controllers')
.controller('CashPaymentRegistryController', CashPaymentRegistryController);

// dependencies injection
CashPaymentRegistryController.$inject = [
  'CashService', 'bhConstants', 'NotifyService', 'SessionService', 'ModalService',
  'uiGridConstants',  'uiGridGroupingConstants', 'LanguageService'
];

/**
 * Cash Payment Registry Controller
 * This controller is responsible to display all cash payment made and provides
 * print and search utilities for the registry
 */
function CashPaymentRegistryController(Cash, bhConstants, Notify, Session, Modal, uiGridConstants, uiGridGroupingConstants, Languages) {
  var vm = this;

  var initFilter = { identifiers: {}, display: {} };

  // global variables
  vm.filters = { lang: Languages.key };
  vm.formatedFilters = [];
  vm.gridOptions = {};
  vm.loading = false;
  vm.enterprise = Session.enterprise;
  vm.bhConstants = bhConstants;

  // expose to the view
  vm.showReceipt = showReceipt;
  vm.search = search;
  vm.onRemoveFilter = onRemoveFilter;
  vm.clearFilters = clearFilters;
  vm.cancelCash = cancelCash;

  // Background color for make the difference betwen the valid and cancel paiement
  var reversedBackgroundColor = {'background-color': '#ffb3b3' };
  var regularBackgroundColor = { 'background-color': 'none' };

  // grid default options
  vm.gridOptions = {
    appScopeProvider : vm,
    showColumnFooter : true,
    enableColumnMenus : false,
    flatEntityAccess : true,
    fastWatch : true,
    enableFiltering  : vm.filterEnabled
  };

  vm.gridOptions.columnDefs = [
    { field : 'reference', displayName : 'TABLE.COLUMNS.REFERENCE',
      headerCellFilter: 'translate', aggregationType: uiGridConstants.aggregationTypes.count, aggregationHideLabel : true
    }, {
      field : 'date', displayName : 'TABLE.COLUMNS.DATE', headerCellFilter: 'translate', cellFilter : 'date:"mediumDate"',
      customTreeAggregationFinalizerFn: timeAggregation
    }, {
      field : 'debtor_name', displayName : 'TABLE.COLUMNS.CLIENT', headerCellFilter: 'translate'
    }, {
      field : 'description', displayName : 'TABLE.COLUMNS.DESCRIPTION', headerCellFilter: 'translate'
    }, {
      field : 'amount', displayName : 'TABLE.COLUMNS.AMOUNT', headerCellFilter: 'translate',
      cellTemplate: 'partials/finance/reports/cash_payment/templates/amount.grid.html'
    }, {
      field : 'cashbox_label', displayName : 'TABLE.COLUMNS.CASHBOX', headerCellFilter: 'translate'
    }, {
      field : 'display_name', displayName : 'TABLE.COLUMNS.USER', headerCellFilter: 'translate'
    }, {
      field : 'action', displayName : '', enableFiltering: false, enableSorting: false,
      cellTemplate: 'partials/finance/reports/cash_payment/templates/action.grid.html'
    }, {
      field : 'action', displayName : '', enableFiltering: false, enableSorting: false,
      cellTemplate: 'partials/finance/reports/cash_payment/templates/cancelCash.action.tmpl.html'
    }
  ];

  vm.gridOptions.rowTemplate = '/partials/finance/reports/cash_payment/templates/grid.canceled.tmpl.html';

  // search
  function search() {
    Modal.openSearchCashPayment()
      .then(function (filters) {
        if (!filters) { return; }
        reload(filters);
      })
      .catch(Notify.handleError);
  }

  // on remove one filter
  function onRemoveFilter(key) {
    if (key === 'dateFrom' ||  key === 'dateTo') {
      // remove all dates filters if one selected
      delete vm.filters.identifiers.dateFrom;
      delete vm.filters.identifiers.dateTo;
      delete vm.filters.display.dateFrom;
      delete vm.filters.display.dateTo;
    } else {
      // remove the key
      delete vm.filters.identifiers[key];
      delete vm.filters.display[key];
    }
    reload(vm.filters);
  }

  // remove a filter with from the filter object, save the filters and reload
  function clearFilters() {
    reload(initFilter);
  }

  // reload with filter
  function reload(filters) {
    vm.filters = filters;
    vm.formatedFilters = Cash.formatFilterParameters(filters.display);
    load(filters.identifiers);
  }

  // showReceipt
  function showReceipt(uuid) {
    var url = '/reports/finance/cash/' + uuid;
    var params = { renderer: 'pdf', lang: Languages.key };
    Modal.openReports({ url: url, params: params });
  }

  // Time Aggregation
  function timeAggregation(aggregation) {
    var date = new Date(aggregation.groupVal);
    var time = date.getHours() + ':' + date.getMinutes();
    aggregation.rendered = aggregation.groupVal ? date.toDateString().concat('  (', time, ')') : null;
  }

  // load cash
  function load(filters) {
    Cash.search(filters)
      .then(function (rows) {
        rows.forEach(function (row) {
          row._backgroundColor =
            (row.type_id === bhConstants.transactionType.CREDIT_NOTE) ?  reversedBackgroundColor : regularBackgroundColor;
        });

        vm.gridOptions.data = rows;
      })
      .catch(Notify.handleError);
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

  // startup
  load();

}
