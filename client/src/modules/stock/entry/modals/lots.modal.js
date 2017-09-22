angular.module('bhima.controllers')
  .controller('StockDefineLotsModalController', StockDefineLotsModalController);

StockDefineLotsModalController.$inject = [
  '$uibModalInstance', 'NotifyService', 'uiGridConstants', 'data',
  'SessionService',
];

function StockDefineLotsModalController(Instance, Notify, uiGridConstants, Data, Session) {
  var vm = this;

  // globals
  vm.inventory = { lots: [] };
  vm.gridApi = {};
  vm.enterprise = Session.enterprise;
  vm.entryType = Data.entry_type;
  

  /* ======================= Grid configurations ============================ */
  vm.gridOptions = {
    appScopeProvider  : vm,
    enableSorting     : false,
    enableColumnMenus : false,
    showColumnFooter  : true,
    fastWatch         : true,
    flatEntityAccess  : true,
    columnDefs        : [
      { field        : 'status',
        width        : 25,
        displayName  : '',
        cellTemplate : 'modules/stock/entry/modals/templates/lot.status.tmpl.html' },

      { field            : 'lot',
        displayName      : 'TABLE.COLUMNS.LOT',
        headerCellFilter : 'translate',
        aggregationType  : uiGridConstants.aggregationTypes.count,
        aggregationHideLabel : true,
        cellTemplate     : 'modules/stock/entry/modals/templates/lot.input.tmpl.html' },

      { field            : 'quantity',
        width            : 150,
        displayName      : 'TABLE.COLUMNS.QUANTITY',
        headerCellFilter : 'translate',
        aggregationType  : uiGridConstants.aggregationTypes.sum,
        aggregationHideLabel : true,
        footerCellClass  : 'text-right',
        cellTemplate     : 'modules/stock/entry/modals/templates/lot.quantity.tmpl.html' },

      { field            : 'expiration_date',
        width            : 150,
        displayName      : 'TABLE.COLUMNS.EXPIRATION_DATE',
        headerCellFilter : 'translate',
        cellTemplate     : 'modules/stock/entry/modals/templates/lot.expiration.tmpl.html' },

      { field        : 'actions',
        width        : 25,
        cellTemplate : 'modules/stock/entry/modals/templates/lot.actions.tmpl.html' },
    ],
    onRegisterApi : onRegisterApi,
  };

  vm.gridOptions.data = vm.inventory.lots;

  function onRegisterApi(api) {
    vm.gridApi = api;
  }
  /* ======================= End Grid ======================================== */

  // bind methods
  vm.submit = submit;
  vm.cancel = cancel;
  vm.addLot = addLot;
  vm.removeLot = removeLot;
  vm.handleChange = handleChange;
  vm.onDateChangeCallback = onDateChangeCallback;

  // init
  function init() {
    vm.inventory = Data.inventory;
    vm.remainingQuantity = vm.inventory.quantity;

    if (vm.inventory.lots.length) {
      vm.gridOptions.data = vm.inventory.lots;
    } else {
      addLot();
    }
  }

  // add lot
  function addLot() {
    if (vm.remainingQuantity <= 0 && vm.entryType !== 'integration') {
      vm.maxLotReached = true;
      return;
    }
    vm.gridOptions.data.push({
      is_valid        : false,
      lot             : vm.inventory.lot || '',
      expiration_date : vm.inventory.expiration_date ? new Date(vm.inventory.expiration_date) : new Date(),
      quantity        : vm.remainingQuantity,
    });

    //  if it is a transfer reception, so force the validation on the single element
    if(vm.entryType === 'transfer_reception') {
      handleChange(vm.gridOptions.data[0]);
    }

  }

  // remove lot
  function removeLot(index) {
    vm.gridOptions.data.splice(index, 1);
  }

  // handle date change
  function onDateChangeCallback(date, inventory) {
    inventory.expiration_date = date;
    // notify date change
    handleChange(inventory);
  }


  function hasInvalidInventory(hasQuantity, hasExpiration) {
    var error;

    var isExpiration = hasExpiration ? false : true;
    var isExcessiveQuatity = hasQuantity ? false : true;

    if (isExcessiveQuatity) {
      vm.errorText = 'STOCK.ERRORS.EXCESSIVE_QUANTITY';
      error = true;
    } else if (isExpiration) {
      vm.errorText = 'STOCK.ERRORS.PLEASE_CHECK_EXPIRY_DATE';
      error = true;
    }

    return error;
  }

  // handleChange
  function handleChange(inventory) {
    vm.error =  false;

    var sum = vm.gridOptions.data.reduce(sumQuantity, 0);  
    var hasQuantity = (vm.inventory.quantity >= sum);
    var hasLotLabel = inventory.lot;
    var hasExpiration = (new Date(inventory.expiration_date) >= new Date());
    inventory.is_valid = (hasQuantity && hasLotLabel && hasExpiration);

    vm.error = hasInvalidInventory(hasQuantity, hasExpiration);
    vm.submitError = vm.error ? vm.error : false;


    vm.remainingQuantity = (vm.inventory.quantity - sum >= 0) ? vm.inventory.quantity - sum : 0;
    vm.sum = sum;

    if (vm.remainingQuantity) {
      vm.maxLotReached = false;
    }
  }

  // check rows validity
  function validLots() {
    return vm.gridOptions.data.every(function (item) {
      return item.is_valid === true;
    });
  }

  // submit
  function submit(detailsForm) {
    // This structure check if there are empty field
    if (detailsForm.$invalid) {
      vm.submitError = true;
      vm.errorText = vm.error ? vm.error : 'FORM.ERRORS.RECORD_ERROR'; 

      return;
    } else {
      vm.submitError = false;
      // If the form is still at this level the only remaining reason is the expiration date

      if (!validLots()) { 
        vm.submitError = vm.error ? vm.error : false;

        return;         
      }
    }

    Instance.close({ lots: vm.gridOptions.data, quantity: vm.sum });
  }

  // cancel
  function cancel() {
    Instance.dismiss();
  }

  // sum
  function sumQuantity(current, previous) {
    return previous.quantity + current;
  }

  // determine if the inventory quantity and cost should be editable or not.
  vm.hasEditableInventory = (vm.entryType !== 'purchase' && vm.entryType !== 'transfer_reception');

  init();
}
