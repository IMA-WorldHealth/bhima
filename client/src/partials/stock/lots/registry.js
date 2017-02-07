angular.module('bhima.controllers')
.controller('StockLotsController', StockLotsController);

StockLotsController.$inject = [
    '$state', 'StockService', 'NotifyService',
    'uiGridConstants', '$translate'
];

/**
 * Stock lots Controller
 * This module is a registry page for stock lots 
 */
function StockLotsController($state, Stock, Notify, uiGridConstants, $translate) {
  var vm = this;

  // headercrumb paths
  vm.bcPaths = [
    { label : 'TREE.STOCK' },
    { label : 'TREE.STOCK_LOTS' }
  ];

  // headercrumb buttons
  vm.bcButtons = [
    { icon: 'fa fa-search', label: $translate.instant('FORM.LABELS.SEARCH'),
      color: 'btn-default'
    }
  ];

  // headercrumb print 
  vm.buttonPrint = { pdfUrl: '...' };

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

  // load stock lots in the grid
  function loadGrid() {
    Stock.lots.read().then(function (lots) {
      vm.gridOptions.data = lots;
    })
    .catch(Notify.handleError);
  }

  loadGrid();
}
