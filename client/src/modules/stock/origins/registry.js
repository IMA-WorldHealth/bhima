angular.module('bhima.controllers')
.controller('StockOriginsController', StockOriginsController);

StockOriginsController.$inject = [
  'StockService', 'NotifyService',
  'uiGridConstants', '$translate', 'StockModalService',
  'SearchFilterFormatService', 'LanguageService',
  'GridGroupingService', 'ReceiptModal',
];

/**
 * Stock Origin Controller
 * This module is a registry page for stock lots
 */
function StockOriginsController(Stock, Notify,
  uiGridConstants, $translate, Modal,
  SearchFilterFormat, Languages, Grouping, Receipts) {
  var vm = this;

  // map receipts
  var mapOriginDocument = {
    'STOCK.PURCHASE_ORDER' : Receipts.purchase,
  };

  // map entry
  var mapEntryDocument = {
    1 : Receipts.stockEntryPurchaseReceipt,
    13 : Receipts.stockEntryIntegrationReceipt,
  };

  // grouping box
  vm.groupingBox = [
    { label: 'STOCK.INVENTORY', value: 'text' },
  ];

  // global variables
  vm.filters = { lang: Languages.key };
  vm.formatedFilters = [];

  // grid columns
  var columns = [
    { field            : 'reference',
      displayName      : 'STOCK.ORIGIN_DOCUMENT',
      headerCellFilter : 'translate' },

    { field            : 'display_name',
      displayName      : 'STOCK.ORIGIN',
      cellFilter       : 'translate',
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

    { field            : 'entry_date',
      displayName      : 'STOCK.ENTRY_DATE',
      headerCellFilter : 'translate',
      cellFilter       : 'date' },

    { field            : 'expiration_date',
      displayName      : 'STOCK.EXPIRATION_DATE',
      headerCellFilter : 'translate',
      cellFilter       : 'date' },

    {
      field           : 'action',
      displayName     : '',
      cellTemplate    : '/modules/stock/origins/templates/action.tmpl.html',
      enableFiltering : false,
      enableSorting   : false },
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

  vm.grouping = new Grouping(vm.gridOptions, true, 'reference', vm.grouped, true);

  // expose to the view
  vm.search = search;
  vm.onRemoveFilter = onRemoveFilter;
  vm.clearFilters = clearFilters;
  vm.selectGroup = selectGroup;
  vm.toggleGroup = toggleGroup;
  vm.getOriginDocument = getOriginDocument;
  vm.getEntryDocument = getEntryDocument;

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

  function getOriginDocument(uuid, origin) {
    if (!mapOriginDocument[origin]) { return; }

    mapOriginDocument[origin](uuid);
  }

  function getEntryDocument(uuid, fluxId) {
    if (!mapEntryDocument[fluxId]) { return; }

    mapEntryDocument[fluxId](uuid);
  }

  // clear all filters
  function clearFilters() {
    SearchFilterFormat.clearFilters(reload);
  }

  // load stock lots in the grid
  function load(filters) {
    var today = { defaultPeriod: 'today' };
    var params = filters;

    var noFilter = (!filters);
    var noAttributes = (noFilter || (Object.keys(filters).length === 0));

    if (noAttributes) {
      params = today;
      vm.isToday = true;
      vm.filters = { display: today, identifiers: today };
      vm.formatedFilters = SearchFilterFormat.formatDisplayNames(vm.filters.display);
    }

    Stock.stocks.read('/origins', params).then(function (lots) {
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

      vm.isToday = false;
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
