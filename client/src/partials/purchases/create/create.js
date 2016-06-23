angular.module('bhima.controllers')
.controller('PurchaseOrderController', PurchaseOrderController);

PurchaseOrderController.$inject = [
  'PurchaseOrderService', 'PurchaseOrderForm', 'SupplierService', 'NotifyService',
  'SessionService', 'util'
];


function PurchaseOrderController(Purchases, PurchaseOrder, Suppliers, Notify, Session, util) {
  var vm = this;

  // create a new purchase order form
  vm.order = new PurchaseOrder('PurchaseOrder');

  vm.itemIncrement = 1;
  vm.enterprise = Session.enterprise;
  vm.maxLength = util.maxLength;

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
      { field: 'status', width: 25, displayName : '', cellTemplate: 'partials/purchases/create/templates/status.tmpl.html' },
      { field: 'code', width: 150, displayName: 'TABLE.COLUMNS.CODE', headerCellFilter: 'translate', cellTemplate:  'partials/purchases/create/templates/code.tmpl.html' },
      { field: 'description', displayName: 'TABLE.COLUMNS.DESCRIPTION', headerCellFilter: 'translate' },
      { field: 'unit', width:100, displayName: 'TABLE.COLUMNS.UNIT', headerCellFilter: 'translate' },
      { field: 'quantity', width:100, displayName: 'TABLE.COLUMNS.QUANTITY', headerCellFilter: 'translate', cellTemplate: 'partials/purchases/create/templates/quantity.tmpl.html' },
      { field: 'unit_price', width: 100, displayName: 'TABLE.COLUMNS.UNIT_PRICE', headerCellFilter: 'translate', cellTemplate: 'partials/purchases/create/templates/price.tmpl.html' },
      { field: 'amount', width:100, displayName: 'TABLE.COLUMNS.AMOUNT', headerCellFilter: 'translate', cellTemplate: 'partials/purchases/create/templates/amount.tmpl.html' },
      { field: 'actions', width: 25, cellTemplate: 'partials/purchases/create/templates/actions.tmpl.html' }
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
