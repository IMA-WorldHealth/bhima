angular.module('bhima.controllers')
.controller('StockInventoriesController', StockInventoriesController);

StockInventoriesController.$inject = [
    '$state', 'StockService', 'NotifyService',
    'uiGridConstants', '$translate', 'StockModalService',
    'SearchFilterFormatService', 'LanguageService', 'SessionService',    
];

/**
 * Stock movements Controller
 * This module is a registry page for stock movements 
 */
function StockInventoriesController($state, Stock, Notify, uiGridConstants, $translate, Modal, SearchFilterFormat, Languages, Session) {
  var vm = this;

  // global variables 
  vm.filters         = { lang: Languages.key };
  vm.formatedFilters = [];
  vm.enterprise      = Session.enterprise;

  // grid columns 
  var columns = [
      { field : 'depot_text', displayName : 'STOCK.DEPOT', headerCellFilter: 'translate',
        aggregationType : uiGridConstants.aggregationTypes.count },

      { field : 'text', displayName : 'STOCK.INVENTORY', headerCellFilter: 'translate',
        width: '20%' },
      
      { field : 'quantity', 
        displayName : 'STOCK.QUANTITY', 
        headerCellFilter: 'translate',
        aggregationType : uiGridConstants.aggregationTypes.sum,
        cellClass: 'text-right',
        footerCellClass: 'text-right'
      },

      { field : 'status', displayName : 'STOCK.STATUS.LABEL', headerCellFilter: 'translate', 
        enableFiltering: false, enableSorting: false, 
        cellTemplate: 'partials/stock/inventories/templates/status.cell.html' },

      { field : 'avg_consumption', displayName : 'CM',  
        enableFiltering: false, enableSorting: false,
        cellClass: 'text-right', 
        cellTemplate: '' },

      { field : 'S_MONTH', displayName : 'STOCK.MONTH', headerCellFilter: 'translate', 
        enableFiltering: false, enableSorting: false, 
        cellClass: 'text-right',
        cellTemplate: '' },

      { field : 'S_SEC', displayName : 'SS',  
        enableFiltering: false, enableSorting: false, 
        cellClass: 'text-right',
        cellTemplate: '' },

      { field : 'S_MIN', displayName : 'MIN',  
        enableFiltering: false, enableSorting: false, 
        cellClass: 'text-right',
        cellTemplate: '' },

      { field : 'S_MAX', displayName : 'MAX',  
        enableFiltering: false, enableSorting: false, 
        cellClass: 'text-right',
        cellTemplate: '' },

      { field : 'S_Q', displayName : 'Q', 
        enableFiltering: false, enableSorting: false, 
        cellClass: 'text-right',
        cellTemplate: 'partials/stock/inventories/templates/appro.cell.html' },

      { field : 'action', displayName : '', 
        enableFiltering: false, enableSorting: false, 
        cellTemplate: 'partials/stock/inventories/templates/action.cell.html' }
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
    Stock.inventories.read(null, filters).then(function (rows) {
      vm.gridOptions.data = stockManagementProcess(rows);
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

  // stock management 
  function stockManagementProcess(inventories) {
    var CM, Q;
    return inventories.map(function (inventory) {
      Q = inventory.quantity; // the quantity 
      CM = inventory.avg_consumption; // consommation mensuelle
      inventory.S_SEC = CM * inventory.delay; // stock de securite
      inventory.S_MIN = inventory.S_SEC * 2; // stock minimum
      inventory.S_MAX = CM * inventory.purchase_interval + inventory.S_MIN; // stock maximum 
      inventory.S_MONTH = inventory.quantity / CM; // mois de stock 
      inventory.S_Q = inventory.S_MAX - inventory.quantity; // Commande d'approvisionnement  
      // todo: risque a perime (RP) = Stock - (Mois avant expiration * CM) // it is relatives to lots

      if (Q <= 0) {
        inventory.status = 'sold_out';
      } else if (Q > 0 && Q <= inventory.S_SEC) {
        inventory.status = 'security_reached';
      } else if (Q > inventory.S_SEC && Q <= inventory.S_MIN) {
        inventory.status = 'minimum_reached';
      } else if (Q > inventory.S_MIN && Q <= inventory.S_MAX) {
        inventory.status = 'in_stock';
      } else if (Q > inventory.S_MAX) {
        inventory.status = 'over_maximum';
      } else {
        inventory.status = '';
      }

      return inventory;
    });
  }

  load();
}
