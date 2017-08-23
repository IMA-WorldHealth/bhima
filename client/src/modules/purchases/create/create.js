angular.module('bhima.controllers')
.controller('PurchaseOrderController', PurchaseOrderController);

PurchaseOrderController.$inject = [
  'PurchaseOrderService', 'PurchaseOrderForm', 'SupplierService', 'NotifyService',
  'SessionService', 'util', 'ReceiptModal', 'bhConstants'
];


function PurchaseOrderController(Purchases, PurchaseOrder, Suppliers, Notify, Session, util, Receipts, bhConstants) {
  var vm = this;

  // create a new purchase order form
  vm.order = new PurchaseOrder('PurchaseOrder');
  vm.bhConstants = bhConstants;

  vm.itemIncrement = 1;
  vm.enterprise = Session.enterprise;
  vm.maxLength = util.maxLength;
  vm.maxDate = new Date();
  vm.loagingState = false;

  // make sure we have all the suppliers we need.
  Suppliers.read()
  .then(function (suppliers) {
    vm.suppliers = suppliers;
  })
  .catch(Notify.handleError);

  // grid options for the purchase order grid
  var gridOptions = {
    appScopeProvider : vm,
    enableSorting : false,
    enableColumnMenus : false,
    columnDefs : [
      { field: 'status', width: 25, displayName : '', cellTemplate: 'modules/purchases/create/templates/status.tmpl.html' },
      { field: 'code', width: 150, displayName: 'TABLE.COLUMNS.CODE', headerCellFilter: 'translate', cellTemplate:  'modules/purchases/create/templates/code.tmpl.html' },
      { field: 'description', displayName: 'TABLE.COLUMNS.DESCRIPTION', headerCellFilter: 'translate' },
      { field: 'unit', width:100, displayName: 'TABLE.COLUMNS.UNIT', headerCellFilter: 'translate' },
      { field: 'quantity', width:100, displayName: 'TABLE.COLUMNS.QUANTITY', headerCellFilter: 'translate', cellTemplate: 'modules/purchases/create/templates/quantity.tmpl.html' },
      { field: 'unit_price', width: 100, displayName: 'TABLE.COLUMNS.UNIT_PRICE', headerCellFilter: 'translate', cellTemplate: 'modules/purchases/create/templates/price.tmpl.html' },
      { field: 'amount', width:100, displayName: 'TABLE.COLUMNS.AMOUNT', headerCellFilter: 'translate', cellTemplate: 'modules/purchases/create/templates/amount.tmpl.html' },
      { field: 'actions', width: 25, cellTemplate: 'modules/purchases/create/templates/actions.tmpl.html' }
    ],
    onRegisterApi : onRegisterApi,
    data : vm.order.store.data
  };

  // adds n items to the purchase order grid
  function addItems(n) {
    while (n--) { vm.order.addItem(); }
  }

  // expose the API so that scrolling methods can be used
  function onRegisterApi(api) {
    vm.gridApi = api;
  }

  // submits the form
  function submit(form) {

    // make sure form validation is triggered
    form.$setSubmitted();

    // check the form for invalid inputs
    if (form.$invalid) {
      Notify.danger('FORM.ERRORS.RECORD_ERROR');
      return;
    }

    // check the grid for invalid items
    var invalidItems = vm.order.validate();

    if (invalidItems.length) {
      Notify.danger('PURCHASES.ERRORS.INVALID_ITEMS');

      var firstInvalidItem = invalidItems[0];

      // show the user where the error is in the grid by scrolling to it.
      vm.gridApi.core.scrollTo(firstInvalidItem);
      return;
    }

    // copy the purchase order object into something that can be sent to the server
    var order = angular.copy(vm.order.details);
    order.items = angular.copy(vm.order.store.data);

    vm.loadingState = true;

    return Purchases.create(order)
      .then(function (res) {

        // open the receipt modal
        Receipts.purchase(res.uuid, true);

        // reset the module
        clear(form);
      })
      .catch(Notify.handleError)
      .finally(function () {
        vm.loadingState = false;
      });
  }

  // fired whenever an input in the grid is changed.
  function handleChange() {
    vm.order.digest();
    vm.order.validate();
  }

  // clears the module, resetting it
  function clear(form) {

    // remove the data
    delete vm.supplier;
    vm.order.setup();

    // if the form was passed in, reset the validation
    if (form) {
      form.$setPristine();
      form.$setUntouched();
    }
  }

  // bind methods
  vm.gridOptions = gridOptions;
  vm.addItems = addItems;
  vm.submit = submit;
  vm.clear = clear;
  vm.handleChange = handleChange;

  // trigger the module start
  clear();
}
