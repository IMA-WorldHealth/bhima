angular.module('bhima.controllers')
.controller('StockLotsController', StockLotsController);

StockLotsController.$inject = [
    '$state', 'StockService', 'NotifyService',
    'uiGridConstants', '$translate', 'StockModalService',
    'SearchFilterFormatService', 'LanguageService'
];

/**
 * Stock lots Controller
 * This module is a registry page for stock lots 
 */
function StockLotsController($state, Stock, Notify, uiGridConstants, $translate, Modal, SearchFilterFormat, Languages) {
  var vm = this;

  // global variables 
  vm.filters         = { lang: Languages.key };
  vm.formatedFilters = [];

  // grid columns 
  var columns = [
      { field : 'code', 
        displayName : 'STOCK.CODE', 
        headerCellFilter: 'translate', 
        aggregationType : uiGridConstants.aggregationTypes.count 
      },
      { field : 'text', displayName : 'STOCK.INVENTORY', headerCellFilter: 'translate' },
      { field : 'label', displayName : 'STOCK.LOT', headerCellFilter: 'translate' },
      { field : 'quantity', 
        displayName : 'STOCK.QUANTITY', 
        headerCellFilter: 'translate',
        aggregationType : uiGridConstants.aggregationTypes.sum
      },
      { field : 'entry_date', displayName : 'STOCK.ENTRY_DATE', headerCellFilter: 'translate', cellFilter: 'date' },
      { field : 'expiration_date', displayName : 'STOCK.EXPIRATION_DATE', headerCellFilter: 'translate', cellFilter: 'date' },
      { field : 'depot_text', displayName : 'STOCK.DEPOT', headerCellFilter: 'translate'  }
    ];

  // options for the UI grid
  vm.gridOptions = {
    appScopeProvider  : vm,
    enableColumnMenus : false,
    columnDefs        : columns,
    enableSorting     : true,
    showColumnFooter  : true
  };

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
    Stock.lots.read(null, filters).then(function (lots) {
      vm.gridOptions.data = lots;
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
