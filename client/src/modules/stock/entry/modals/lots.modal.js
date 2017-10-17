angular.module('bhima.controllers')
  .controller('StockDefineLotsModalController', StockDefineLotsModalController);

StockDefineLotsModalController.$inject = [
  '$uibModalInstance', 'NotifyService', 'uiGridConstants', 'data',
  'SessionService',
];

function StockDefineLotsModalController(Instance, Notify, uiGridConstants, Data, Session) {
  var vm = this;

  vm.enterprise = Session.enterprise;
  vm.stockLine = Data.inventory;
  vm.entryType = Data.entry_type;
  vm.gridApi = {};

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
        displayName: 'TABLE.COLUMNS.EXPIRATION_DATE',
        headerCellFilter: 'translate',
        cellTemplate: 'modules/stock/entry/modals/templates/lot.expiration.tmpl.html'
      },

      {
        field: 'actions',
        width: 25,
        cellTemplate: 'modules/stock/entry/modals/templates/lot.actions.tmpl.html'
      }
    ],
    data: vm.stockLine.lots,
    onRegisterApi: onRegisterApi
  };

  // exposing method to the view
  // vm.submit = submit;
  // vm.cancel = cancel;
  vm.addLot = addLot;
  vm.checkLine = checkLine
  // vm.removeLot = removeLot;
  // vm.handleChange = handleChange;
  // vm.onDateChangeCallback = onDateChangeCallback;

  function init() {
    if (!vm.stockLine.lots.length) {
      addLot();
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



    // if (vm.remainingQuantity <= 0 && vm.entryType !== 'integration') {
    //   vm.maxLotReached = true;
    //   return;
    // }
    // 

    //  if it is a transfer reception, so force the validation on the single element
    // if (vm.entryType === 'transfer_reception') {
    //   handleChange(vm.gridOptions.data[0]);
    // }

  }

  function onRegisterApi(api) {
    vm.gridApi = api;
  }

  function checkAll() {
    var localCondition = vm.stockLine.lots.every(function (lot) {
      return lot.isValid === true;
    });

    var sum = vm.stockLine.lots.reduce(function (x, y) {
      return x.quantity + y.quantity;
    });

    var globalCondition = sum <= vm.stockLine.quantity;

    vm.globalValidity = localCondition && globalCondition;

    if (!localCondition) {
      vm.errorLocal = 'STOCK.ERRORS.LINE_ERROR';
    }

    if (!globalCondition) {
      vm.errorGlobal = 'STOCK.ERRORS.LINE_ERROR';
    }
  }

  function checkLine(line, date) {
    if (date) { line.expiration_date = date; }

    var isPosterior = new Date(line.expiration_date).getTime() >= new Date().getTime();
    line.isValid = (line.lot && line.quantity > 0 && isPosterior);
  }

  init();
}












  // // function removeLot(index) {
  // //   vm.gridOptions.data.splice(index, 1);
  // //   validLots();
  // // }

  // // function onDateChangeCallback(date, inventory) {
  // //   inventory.expiration_date = date;
  // //   // notify date change
  // //   handleChange(inventory);
  // // }


  // // function validLots() {
  // //   return vm.gridOptions.data.every(function (item) {
  // //     return item.is_valid === true;
  // //   });
  // // }

  // // function submit(detailsForm) {
  // //   // This structure check if there are empty field
  // //   if (detailsForm.$invalid) {
  // //     vm.submitError = true;
  // //     vm.errorText = vm.error ? vm.error : 'FORM.ERRORS.RECORD_ERROR';

  // //     return;
  // //   } else {
  // //     vm.submitError = false;
  // //     // If the form is still at this level the only remaining reason is the expiration date

  // //     if (!validLots()) {
  // //       vm.submitError = vm.error ? vm.error : false;

  // //       return;
  // //     }
  // //   }

  // //   Instance.close({ lots: vm.gridOptions.data, quantity: vm.sum });
  // // }

  // // function cancel() {
  // //   Instance.dismiss();
  // // }

  // // function sumQuantity(current, previous) {
  // //   return previous.quantity + current;
  // // }

  // // // determine if the inventory quantity and cost should be editable or not.
  // // vm.hasEditableInventory = (vm.entryType !== 'purchase' && vm.entryType !== 'transfer_reception');

  // init();
