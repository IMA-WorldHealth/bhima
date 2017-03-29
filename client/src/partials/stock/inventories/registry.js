angular.module('bhima.controllers')
.controller('StockInventoriesController', StockInventoriesController);

StockInventoriesController.$inject = [
  '$state', 'StockService', 'NotifyService',
  'uiGridConstants', '$translate', 'StockModalService',
  'SearchFilterFormatService', 'LanguageService', 'SessionService',
  'GridGroupingService',
];

/**
 * Stock movements Controller
 * This module is a registry page for stock movements
 */
function StockInventoriesController($state, Stock, Notify,
  uiGridConstants, $translate, Modal,
  SearchFilterFormat, Languages, Session, Grouping) {
  var vm = this;

  // global variables
  vm.filters = { lang: Languages.key };
  vm.formatedFilters = [];
  vm.enterprise = Session.enterprise;

  // grid columns
  var columns = [
    { field            : 'depot_text',
      displayName      : 'STOCK.DEPOT',
      headerCellFilter : 'translate' },

    { field            : 'code',
      displayName      : 'STOCK.CODE',
      headerCellFilter : 'translate' },

    { field            : 'text',
      displayName      : 'STOCK.INVENTORY',
      headerCellFilter : 'translate',
      width            : '20%' },

    { field            : 'quantity',
      displayName      : 'STOCK.QUANTITY',
      headerCellFilter : 'translate',
      aggregationType  : uiGridConstants.aggregationTypes.sum,
      cellClass        : 'text-right',
      footerCellClass  : 'text-right',
    },

    { field            : 'unit_type',
      width            : 75,
      displayName      : 'TABLE.COLUMNS.UNIT',
      headerCellFilter : 'translate',
      cellTemplate     : 'partials/stock/inventories/templates/unit.tmpl.html' },

    { field            : 'status',
      displayName      : 'STOCK.STATUS.LABEL',
      headerCellFilter : 'translate',
      enableFiltering  : false,
      enableSorting    : false,
      cellTemplate     : 'partials/stock/inventories/templates/status.cell.html' },

    { field           : 'avg_consumption',
      displayName     : 'CM',
      enableFiltering : false,
      enableSorting   : false,
      cellClass       : 'text-right',
      cellTemplate    : '' },

    { field            : 'S_MONTH',
      displayName      : 'STOCK.MONTH',
      headerCellFilter : 'translate',
      enableFiltering  : false,
      enableSorting    : false,
      cellClass        : 'text-right',
      cellTemplate     : '' },

    { field           : 'S_SEC',
      displayName     : 'SS',
      enableFiltering : false,
      enableSorting   : false,
      cellClass       : 'text-right',
      cellTemplate    : '' },

    { field           : 'S_MIN',
      displayName     : 'MIN',
      enableFiltering : false,
      enableSorting   : false,
      cellClass       : 'text-right',
      cellTemplate    : '' },

    { field           : 'S_MAX',
      displayName     : 'MAX',
      enableFiltering : false,
      enableSorting   : false,
      cellClass       : 'text-right',
      cellTemplate    : '' },

    { field            : 'S_Q',
      displayName      : 'STOCK.ORDERS',
      headerCellFilter : 'translate',
      enableFiltering  : false,
      enableSorting    : false,
      cellClass        : 'text-right',
      cellTemplate     : 'partials/stock/inventories/templates/appro.cell.html' },
  ];

  // options for the UI grid
  vm.gridOptions = {
    appScopeProvider  : vm,
    enableColumnMenus : false,
    columnDefs        : columns,
    enableSorting     : true,
    showColumnFooter  : true,
  };

  vm.grouping = new Grouping(vm.gridOptions, true, 'depot_text', vm.grouped, true);

  // expose to the view
  vm.search = search;
  vm.onRemoveFilter = onRemoveFilter;
  vm.clearFilters = clearFilters;

  // on remove one filter
  function onRemoveFilter(key) {
    SearchFilterFormat.onRemoveFilter(key, vm.filters, reload);
  }

  // clear all filters
  function clearFilters() {
    SearchFilterFormat.clearFilters(reload);
  }

  // load stock lots in the grid
  function load(filters) {
    Stock.inventories.read(null, filters).then(function (rows) {
      vm.gridOptions.data = rows;
    })
    .catch(Notify.handleError);
  }

  // search modal
  function search() {
    Modal.openSearchInventories()
    .then(function (filters) {
      if (!filters) { return; }
      reload(filters);
    })
    .catch(Notify.handleError);
  }

  // reload
  function reload(filters) {
    vm.filters = filters;
    vm.formatedFilters = SearchFilterFormat.formatDisplayNames(filters.display);
    load(filters.identifiers);
  }

  load();
}
