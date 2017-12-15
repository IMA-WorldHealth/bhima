angular.module('bhima.controllers')
  .controller('StockDefineLotsModalController', StockDefineLotsModalController);

StockDefineLotsModalController.$inject = [
  '$uibModalInstance', 'NotifyService', 'uiGridConstants', 'data',
  'SessionService',
];

function StockDefineLotsModalController(Instance, Notify, uiGridConstants, Data, Session) {
  var vm = this;
  var current = new Date();
  vm.enterprise = Session.enterprise;
  vm.stockLine = Data.stockLine;
  vm.entryType = Data.entry_type;
  vm.gridApi = {};
  vm.isCostEditable = (vm.entryType !== 'purchase' && vm.entryType !== 'transfer_reception');
  
  vm.gridOptions = {
    appScopeProvider: vm,
    enableSorting: false,
    enableColumnMenus: false,
    showColumnFooter: true,
    fastWatch: true,
    flatEntityAccess: true,
    columnDefs: [
      {
        field: 'status',
        width: 25,
        displayName: '',
        cellTemplate: 'modules/stock/entry/modals/templates/lot.status.tmpl.html'
      },

      {
        field: 'lot',
        displayName: 'TABLE.COLUMNS.LOT',
        headerCellFilter: 'translate',
        aggregationType: uiGridConstants.aggregationTypes.count,
        aggregationHideLabel: true,
        cellTemplate: 'modules/stock/entry/modals/templates/lot.input.tmpl.html'
      },

      {
        field: 'quantity',
        type: 'number',
        width: 150,
        displayName: 'TABLE.COLUMNS.QUANTITY',
        headerCellFilter: 'translate',
        aggregationType: uiGridConstants.aggregationTypes.sum,
        aggregationHideLabel: true,
        footerCellClass: 'text-right',
        cellTemplate: 'modules/stock/entry/modals/templates/lot.quantity.tmpl.html'
      },

      {
        field: 'expiration_date',
        type: 'date',
        width: 150,
        visible : (vm.stockLine.expires !== 0),
        displayName: 'TABLE.COLUMNS.EXPIRATION_DATE',
        headerCellFilter: 'translate',
        cellTemplate: 'modules/stock/entry/modals/templates/lot.expiration.tmpl.html'
      },

      {
        field: 'actions',
        width: 25,
        cellTemplate: 'modules/stock/entry/modals/templates/lot.actions.tmpl.html'
      },
    ],
    data: vm.stockLine.lots,
    onRegisterApi: onRegisterApi
  };

  // exposing method to the view
  vm.submit = submit;
  vm.cancel = cancel;
  vm.addLot = addLot;
  vm.checkLine = checkLine
  vm.checkAll = checkAll;
  vm.removeLot = removeLot;

  function sumLot(x, y) {
    return x + y.quantity;
  }

  function init() {
    if (!vm.stockLine.lots.length) {
      addLot();
    } else {
      // if there is at least one lot already, then check only
      checkAll();
    }
  }

  function addLot() {
    vm.stockLine.lots.push({
      isValid: false,
      lot: null,
      expiration_date: new Date(),
      quantity: 0,
    });

    checkAll();
  }

  function onRegisterApi(api) {
    vm.gridApi = api;
  }

  function checkAll() {
    vm.hasNoLot = !vm.stockLine.lots.length > 0;

    vm.isSomeLineIncorrect = vm.stockLine.lots.some(function (lot) {
      return lot.isValid === false;
    });

    vm.sum = vm.stockLine.lots.reduce(sumLot, 0);

    vm.isQuantityIncorrect = vm.sum > vm.stockLine.quantity;

    vm.hasInvalidEntries = vm.isSomeLineIncorrect || vm.isQuantityIncorrect || vm.hasNoLot;
  }

  function checkLine(line, date) {
       
    if (date) { line.expiration_date = date; }
    
    var isPosterior = new Date(line.expiration_date) >= new Date();
    // IF this item doesn't expires, we can consider isposterior = true,
    // no check for the expiration date,
    // the expiration date can have defaut value, this year + 1000 years.
      
    if (vm.stockLine.expires === 0) {
      isPosterior = true;
      line.expiration_date = new Date((current.getFullYear() + 1000), current.getMonth());
    }
    line.isValid = (line.lot && line.quantity > 0 && isPosterior);
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.EDIT);

    checkAll();
  }

  function cancel() {
    Instance.dismiss();
  }

  function removeLot(index) {
    vm.stockLine.lots.splice(index, 1);
    checkAll();
  }

  function submit(detailsForm) {
    if (!vm.hasInvalidEntries) {
      Instance.close({ lots: vm.stockLine.lots, quantity: vm.sum });
    }
  }

  init();
}
