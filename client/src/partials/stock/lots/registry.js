angular.module('bhima.controllers')
.controller('StockLotsController', StockLotsController);

StockLotsController.$inject = [
  '$state', 'StockService', 'NotifyService',
  'uiGridConstants', '$translate', 'StockModalService',
  'SearchFilterFormatService', 'LanguageService',
  'GridGroupingService',
];

/**
 * Stock lots Controller
 * This module is a registry page for stock lots
 */
function StockLotsController($state, Stock, Notify,
  uiGridConstants, $translate, Modal,
  SearchFilterFormat, Languages, Grouping) {
  var vm = this;

  // grouping box
  vm.groupingBox = [
    { label: 'STOCK.INVENTORY', value: 'text' },
  ];

  // global variables
  vm.filters = { lang: Languages.key };
  vm.formatedFilters = [];

  // grid columns
  var columns = [
    { field            : 'depot_text',
      displayName      : 'STOCK.DEPOT',
      headerCellFilter : 'translate' },

    { field            : 'code',
      displayName      : 'STOCK.CODE',
      headerCellFilter : 'translate',
      aggregationType  : uiGridConstants.aggregationTypes.count },

    { field            : 'text',
      displayName      : 'STOCK.INVENTORY',
      headerCellFilter : 'translate' },

    { field            : 'label',
      displayName      : 'STOCK.LOT',
      headerCellFilter : 'translate' },

    { field            : 'quantity',
      displayName      : 'STOCK.QUANTITY',
      headerCellFilter : 'translate',
      aggregationType  : uiGridConstants.aggregationTypes.sum },

    { field            : 'unit_type',
      width            : 75,
      displayName      : 'TABLE.COLUMNS.UNIT',
      headerCellFilter : 'translate',
      cellTemplate     : 'partials/stock/inventories/templates/unit.tmpl.html' },
    
    { field: 'entry_date', displayName: 'STOCK.ENTRY_DATE', headerCellFilter: 'translate', cellFilter: 'date' },
    { field: 'expiration_date', displayName: 'STOCK.EXPIRATION_DATE', headerCellFilter: 'translate', cellFilter: 'date' },
    { field: 'delay_expiration', displayName: 'STOCK.EXPIRATION', headerCellFilter: 'translate' },
  ];

  // options for the UI grid
  vm.gridOptions = {
    appScopeProvider  : vm,
    enableColumnMenus : false,
    columnDefs        : columns,
    enableSorting     : true,
    showColumnFooter  : true,
    fastWatch         : true,
    flatEntityAccess  : true,
  };

  vm.grouping = new Grouping(vm.gridOptions, true, 'depot_text', vm.grouped, true);

  // expose to the view
  vm.search = search;
  vm.onRemoveFilter = onRemoveFilter;
  vm.clearFilters = clearFilters;
  vm.selectGroup = selectGroup;
  vm.toggleGroup = toggleGroup;

  // on remove one filter
  function onRemoveFilter(key) {
    SearchFilterFormat.onRemoveFilter(key, vm.filters, reload);
  }

  // select group
  function selectGroup(group) {
    if (!group) { return; }

    vm.selectedGroup = group;
  }

  // toggle group
  function toggleGroup(column) {
    if (vm.grouped) {
      vm.grouping.removeGrouping(column);
      vm.grouped = false;
    } else {
      vm.grouping.changeGrouping(column);
      vm.grouped = true;
    }
  }

  // clear all filters
  function clearFilters() {
    SearchFilterFormat.clearFilters(reload);
  }

  // load stock lots in the grid
  function load(filters) {
    vm.loading = true;
    Stock.lots.read(null, filters).then(function (lots) {
      vm.loading = false;

      vm.gridOptions.data = lots;

      vm.grouping.unfoldAllGroups();
    })
    .catch(Notify.handleError);
  }

  // search modal
  function search() {
    Modal.openSearchLots()
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
