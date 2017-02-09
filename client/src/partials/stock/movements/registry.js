angular.module('bhima.controllers')
.controller('StockMovementsController', StockMovementsController);

StockMovementsController.$inject = [
    '$state', 'StockService', 'NotifyService',
    'uiGridConstants', '$translate', 'StockModalService',
    'SearchFilterFormatService', 'LanguageService', 'SessionService',
    'FluxService'
];

/**
 * Stock movements Controller
 * This module is a registry page for stock movements 
 */
function StockMovementsController($state, Stock, Notify, uiGridConstants, $translate, Modal, SearchFilterFormat, Languages, Session, Flux) {
  var vm = this;

  // global variables 
  vm.filters         = { lang: Languages.key };
  vm.formatedFilters = [];
  vm.enterprise      = Session.enterprise;

  // grid columns 
  var columns = [
      { field : 'depot_text', displayName : 'STOCK.DEPOT', headerCellFilter: 'translate',
        aggregationType : uiGridConstants.aggregationTypes.count },
      { field : 'io', 
        displayName : 'STOCK.IO', 
        headerCellFilter: 'translate',
        cellTemplate: 'partials/stock/movements/templates/io.cell.html'
      },
      { field : 'text', displayName : 'STOCK.INVENTORY', headerCellFilter: 'translate' },
      { field : 'label', displayName : 'STOCK.LOT', headerCellFilter: 'translate' },
      { field : 'quantity', 
        displayName : 'STOCK.QUANTITY', 
        headerCellFilter: 'translate',
        aggregationType : uiGridConstants.aggregationTypes.sum,
        cellClass: 'text-right',
        footerCellClass: 'text-right'
      },
      { field : 'unit_cost', 
        displayName : 'STOCK.UNIT_COST', 
        headerCellFilter: 'translate',
        cellFilter: 'currency:grid.appScope.enterprise.currency_id',
        cellClass: 'text-right'
      },
      { field : 'cost', 
        displayName : 'STOCK.COST', 
        headerCellFilter: 'translate',
        aggregationType : totalCost,
        cellClass: 'text-right',
        cellTemplate: 'partials/stock/movements/templates/cost.cell.html',
        footerCellFilter: 'currency:grid.appScope.enterprise.currency_id',
        footerCellClass: 'text-right'
      },
      { field : 'date', displayName : 'FORM.LABELS.DATE', headerCellFilter: 'translate', cellFilter: 'date' },
      { field : 'flux_id', 
        displayName : 'STOCK.FLUX', 
        headerCellFilter: 'translate',
        cellTemplate: 'partials/stock/movements/templates/flux.cell.html' },
      { field : 'action', displayName : '', 
        enableFiltering: false, enableSorting: false, 
        cellTemplate: 'partials/stock/movements/templates/action.cell.html' }
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
  vm.getFluxName = getFluxName;

  // aggregation total cost 
  function totalCost(items, value) {
    var total = items.reduce(function (previous, current) {
      return current.entity.quantity * current.entity.unit_cost + previous;
    }, 0);
    return total;
  }

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
    Stock.movements.read(null, filters).then(function (rows) {
      vm.gridOptions.data = rows;
    })
    .catch(Notify.handleError);
  }

  // search modal
  function search() {
    Modal.openSearchMovements()
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

  // get flux name 
  function getFluxName(id) {
    return Flux.translate[id];
  }

  load();
}
