angular.module('bhima.controllers')
  .controller('PurchaseOrderController', PurchaseOrderController);

PurchaseOrderController.$inject = [
  'PurchaseOrderService', 'PurchaseOrderForm', 'NotifyService',
  'SessionService', 'util', 'ReceiptModal', 'bhConstants', 'StockService',
  '$state', '$q',
];

/**
 * @function PurchaseOrderController
 *
 * @description
 * The controller binds the functionality of the PurchaseOrderForm to the purchase
 * order create/update modules.
 */
function PurchaseOrderController(Purchases, PurchaseOrder, Notify,
  Session, util, Receipts, bhConstants, Stock, $state, $q) {
  const vm = this;

  // create a new purchase order form
  vm.order = new PurchaseOrder('PurchaseOrder');
  vm.bhConstants = bhConstants;

  const isUpdateState = ($state.params.uuid && $state.params.uuid.length > 0);

  vm.enterprise = Session.enterprise;
  vm.maxLength = util.maxLength;
  vm.maxDate = new Date();
  vm.loadingState = false;
  vm.optimalPurchase = optimalPurchase;
  vm.optimalPO = false;

  const cols = [{
    field : 'status',
    width : 25,
    displayName : '',
    cellTemplate : 'modules/purchases/create/templates/status.tmpl.html',
  }, {
    field : 'code',
    width : 150,
    displayName : 'TABLE.COLUMNS.CODE',
    headerCellFilter : 'translate',
    cellTemplate : 'modules/purchases/create/templates/code.tmpl.html',
  }, {
    field : 'description',
    displayName : 'TABLE.COLUMNS.DESCRIPTION',
    headerCellFilter : 'translate',
  }, {
    field : 'unit',
    width : 100,
    displayName : 'TABLE.COLUMNS.UNIT',
    headerCellFilter : 'translate',
  }, {
    field : 'quantity',
    width : 100,
    displayName : 'TABLE.COLUMNS.QUANTITY',
    headerCellFilter : 'translate',
    cellTemplate : 'modules/purchases/create/templates/quantity.tmpl.html',
  }, {
    field : 'unit_price',
    width : 100,
    displayName : 'TABLE.COLUMNS.PURCHASE_PRICE',
    headerCellFilter : 'translate',
    cellTemplate : 'modules/purchases/create/templates/price.tmpl.html',
  }, {
    field : 'amount',
    width : 100,
    displayName : 'TABLE.COLUMNS.AMOUNT',
    headerCellFilter : 'translate',
    cellTemplate : 'modules/purchases/create/templates/amount.tmpl.html',
  }, {
    field : 'actions',
    width : 25,
    cellTemplate : 'modules/purchases/create/templates/actions.tmpl.html',
  }];

  // grid options for the purchase order grid
  const gridOptions = {
    appScopeProvider : vm,
    enableSorting : false,
    enableColumnMenus : false,
    columnDefs : cols,
    onRegisterApi,
    data : vm.order.store.data,
  };

  // this function will be called whenever items change in the grid.
  function handleUIGridChange() {
    vm.order.digest();
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
      return 0;
    }

    // check the grid for invalid items
    const invalidItems = vm.order.validate();

    if (invalidItems.length) {
      Notify.danger('PURCHASES.ERRORS.INVALID_ITEMS');

      const firstInvalidItem = invalidItems[0];

      // show the user where the error is in the grid by scrolling to it.
      vm.gridApi.core.scrollTo(firstInvalidItem);
      return 0;
    }

    // Set Waiting confirmation as default Purchase Order Status
    vm.order.details.status_id = 1;

    // copy the purchase order object into something that can be sent to the server
    const order = angular.copy(vm.order.details);
    order.items = Purchases.preprocessItemsForSubmission(angular.copy(vm.order.store.data));

    vm.loadingState = true;

    const submitFn = isUpdateState
      ? Purchases.update($state.params.uuid, order)
      : Purchases.create(order);

    return submitFn
      .then((res) => {

        if (!isUpdateState) {
          // reset the module
          clear(form);
        }

        // open the receipt modal
        return Receipts.purchase(res.uuid, true);
      })
      .then(() => {
        if (isUpdateState) { $state.go('purchasesCreate'); }
      })
      .catch(Notify.handleError)
      .finally(() => {
        vm.loadingState = false;
      });
  }

  // clears the module, resetting it
  function clear(form) {

    // remove the data
    vm.order.setup();

    // if the form was passed in, reset the validation
    if (form) {
      form.$setPristine();
      form.$setUntouched();
    }
  }

  function optimalPurchase() {
    vm.optimalPO = true;
    const filters = {
      includeEmptyLot : 0,
      period : 'allTime',
      require_po : 1,
    };

    vm.optimalPurchaseLoading = true;

    Stock.inventories.read(null, filters)
      .then(rows => {
        if (!rows.length) {
          return Notify.warn('FORM.INFO.NO_INVENTORY_PO');
        }

        const optimalPurchaseData = vm.order.formatOptimalPurchase(rows);

        // clear the grid as suggested above
        vm.order.clear();
        optimalPurchaseData.forEach((item) => {
          vm.order.store.post(item);
        });

        vm.order.digest();

        return 0;
      })
      .catch(Notify.handleError)
      .finally(() => {
        vm.optimalPurchaseLoading = false;
      });
  }

  function startup() {
    clear();

    // read the previous purchase order from the database for modification
    if (isUpdateState) {

      // we are using this $q.all() construction to deal with the
      // race condition of not having loaded inventory before
      // trying to set up the purchase form.
      $q.all([
        Purchases.read($state.params.uuid),
        vm.order.ready(),
      ])
        .then(([data]) => {
          vm.order.setupFromPreviousPurchaseOrder(data);
        })
        .catch(err => {
          // if we can't find this uuid, reroute to the create state
          Notify.handleError(err);
          $state.go('purchasesCreate');
        });
    }
  }

  // bind methods
  vm.gridOptions = gridOptions;
  vm.submit = submit;
  vm.clear = () => {

    // NOTE(@jniles): this is somewhat a hack.  You shouldn't do
    // a complete replacement of the form during an update, so if
    // you clear the form, we just send you to the creation state.
    if (isUpdateState) { $state.go('purchasesCreate'); }
    clear();
  };

  vm.handleChange = handleUIGridChange;

  startup();
}
