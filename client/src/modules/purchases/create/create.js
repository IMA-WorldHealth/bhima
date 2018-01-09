angular.module('bhima.controllers')
  .controller('PurchaseOrderController', PurchaseOrderController);

PurchaseOrderController.$inject = [
  'PurchaseOrderService', 'PurchaseOrderForm', 'NotifyService',
  'SessionService', 'util', 'ReceiptModal', 'bhConstants', 'StockService',
];


function PurchaseOrderController(Purchases, PurchaseOrder, Notify, Session, util, Receipts, bhConstants, Stock) {
  var vm = this;

  // create a new purchase order form
  vm.order = new PurchaseOrder('PurchaseOrder');
  vm.bhConstants = bhConstants;

  vm.enterprise = Session.enterprise;
  vm.maxLength = util.maxLength;
  vm.maxDate = new Date();
  vm.loagingState = false;
  vm.setSupplier = setSupplier;
  vm.optimalPurchase = optimalPurchase;
  vm.optimalPO = false;

  function setSupplier(supplier) {
    vm.supplier = supplier;
    vm.order.setSupplier(supplier);
  }

  // grid options for the purchase order grid
  var gridOptions = {
    appScopeProvider : vm,
    enableSorting : false,
    enableColumnMenus : false,
    columnDefs : [
      { field : 'status', width : 25, displayName : '', cellTemplate : 'modules/purchases/create/templates/status.tmpl.html' },
      { field : 'code', width : 150, displayName : 'TABLE.COLUMNS.CODE', headerCellFilter : 'translate', cellTemplate :  'modules/purchases/create/templates/code.tmpl.html' },
      { field : 'description', displayName : 'TABLE.COLUMNS.DESCRIPTION', headerCellFilter : 'translate' },
      { field : 'unit', width :100, displayName : 'TABLE.COLUMNS.UNIT', headerCellFilter : 'translate' },
      { field : 'quantity', width :100, displayName : 'TABLE.COLUMNS.QUANTITY', headerCellFilter : 'translate', cellTemplate : 'modules/purchases/create/templates/quantity.tmpl.html' },
      { field : 'unit_price', width : 100, displayName : 'TABLE.COLUMNS.PURCHASE_PRICE', headerCellFilter : 'translate', cellTemplate : 'modules/purchases/create/templates/price.tmpl.html' },
      { field : 'amount', width :100, displayName : 'TABLE.COLUMNS.AMOUNT', headerCellFilter : 'translate', cellTemplate : 'modules/purchases/create/templates/amount.tmpl.html' },
      { field : 'actions', width : 25, cellTemplate : 'modules/purchases/create/templates/actions.tmpl.html' }
    ],
    onRegisterApi : onRegisterApi,
    data : vm.order.store.data,
  };

  // this function will be called whenever items change in the grid.
  function handleUIGridChange() {
    vm.order.digest();
  }

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

    // Set Waiting confirmation like default Purchase Order Status
    vm.order.details.status_id = 1;

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

  // clears the module, resetting it
  // TODO : Choose a better name for a starting method
  function clear(form) {
    // remove the data
    delete vm.supplier;
    delete vm.order.details.supplier_uuid;

    vm.order.setup();

    // if the form was passed in, reset the validation
    if (form) {
      form.$setPristine();
      form.$setUntouched();
    }
  }

  function optimalPurchase() {
    vm.optimalPO = true;

    Stock.inventories.read(null, { require_po : 1 })
      .then(function (rows) {
        if (!rows.length) {
          return Notify.warn('FORM.INFO.NO_INVENTORY_PO');
        }

        // adding items.length line in the Order store, which will be reflected to the grid
        if (rows.length > 1) {
          vm.order.addItem(rows.length);
        }

        vm.order.store.data.forEach(function (item, index) {
          item.code = rows[index].code;
          item.inventory_uuid = rows[index].inventory_uuid;
          item.description = rows[index].text;
          item.quantity = rows[index].S_Q;
          item.unit_price = 0;
          item.unit = rows[index].unit_type;
          item._initialised = true;
        });

      })
      .catch(Notify.handleError)
      .finally(function () {
        vm.loadingState = false;
      });
  }

  // bind methods
  vm.gridOptions = gridOptions;
  vm.addItems = addItems;
  vm.submit = submit;
  vm.clear = clear;
  vm.handleChange = handleUIGridChange;

  // trigger the module start
  clear();
}
