angular.module('bhima.controllers')
  .controller('ActionRequisitionModalController', ActionRequisitionModalController);

// dependencies injections
ActionRequisitionModalController.$inject = [
  '$state', 'Store', 'InventoryService', 'NotifyService',
  '$uibModalInstance', 'StockService', 'ReceiptModal',
];

function ActionRequisitionModalController(
  $state, Store, Inventories, Notify, Modal, Stock, Receipts,
) {
  const vm = this;
  const store = new Store({ data : [] });
  const columns = [
    {
      field : 'inventory_uuid',
      displayName : 'FORM.LABELS.INVENTORY',
      headerCellFilter : 'translate',
      cellTemplate : 'modules/stock/requisition/templates/inventory.cell.html',
    },

    {
      field : 'description',
      displayName : 'TABLE.COLUMNS.DESCRIPTION',
      headerCellFilter : 'translate',
      cellTemplate : 'modules/stock/requisition/templates/description.cell.html',
    },

    {
      field : 'quantity',
      displayName : 'FORM.LABELS.QUANTITY',
      headerCellFilter : 'translate',
      cellTemplate : 'modules/stock/requisition/templates/quantity.cell.html',
    },

    {
      field : 'action',
      width : 25,
      cellTemplate : 'modules/stock/requisition/templates/remove.cell.html',
    },
  ];

  vm.gridOptions = {
    appScopeProvider : vm,
    enableColumnMenus : false,
    columnDefs : columns,
    enableSorting : true,
    fastWatch : true,
    flatEntityAccess : true,
  };

  vm.model = {};
  vm.addItem = addItem;
  vm.removeItem = removeItem;
  vm.configureItem = configureItem;
  vm.cancel = Modal.close;
  vm.autoSuggestInventories = autoSuggestInventories;

  vm.onSelectDepot = depot => {
    vm.model.depot_uuid = depot.uuid;
  };

  vm.onSelectRequestor = requestor => {
    const DEPOT_REQUESTOR_TYPE = 2;
    vm.model.requestor_type_id = requestor.requestor_type_id;
    vm.model.requestor_uuid = requestor.uuid;
    // enable auto suggestions only if a depot is selected
    vm.enableAutoSuggest = (requestor.requestor_type_id === DEPOT_REQUESTOR_TYPE && requestor.uuid);
  };

  vm.submit = form => {
    if (form.$invalid) { return null; }

    const items = store.data.map(getItem);

    if (!items.length) { return null; }

    angular.extend(vm.model, { items });

    return Stock.stockRequisition.create(vm.model)
      .then(res => {
        Receipts.stockRequisitionReceipt(res.uuid, true);
        Modal.close(true);
      })
      .catch(Notify.handleError);
  };

  function autoSuggestInventories() {
    if (!vm.enableAutoSuggest) { return; }

    toggleLoadingSuggest();

    Stock.inventories.read(null, { depot_uuid : vm.model.requestor_uuid })
      .then(clearAndFillGrid)
      .catch(Notify.handleError)
      .finally(toggleLoadingSuggest);
  }

  function toggleLoadingSuggest() {
    vm.loadingSuggest = !vm.loadingSuggest;
  }

  function clearAndFillGrid(rows) {
    store.clear();
    rows
      .filter(row => row.S_Q > 0)
      .forEach(row => addItem(1, row));
  }

  function getItem(row) {
    return {
      inventory_uuid : row.inventory_uuid,
      quantity : row.quantity,
    };
  }

  function startup() {
    if ($state.params.depot && $state.params.depot.uuid) {
      const DEPOT_REQUESTOR_TYPE = 2;
      const { depot } = $state.params;

      vm.model.requestor_type_id = DEPOT_REQUESTOR_TYPE;
      vm.model.requestor_uuid = depot.uuid;
      // enable auto suggestions only if a depot is selected
      vm.enableAutoSuggest = true;
      autoSuggestInventories();
    }

    Inventories.read()
      .then(rows => {
        vm.selectableInventories = rows;
      })
      .catch(Notify.handleError);
  }

  function addItem(n, item) {
    let i = n;

    while (i--) {
      const row = { id : store.data.length };

      if (item) {
        item.label = item.text;
        row._initialised = true;
        row.inventory = item;
        row.inventory_uuid = item.inventory_uuid;
        row.quantity = item.S_Q;
      }

      store.post(row);
    }

    vm.gridOptions.data = store.data;
  }


  function removeItem(row) {
    store.remove(row.id);
  }

  function configureItem(item) {
    item._initialised = true;
    item.inventory_uuid = item.inventory.uuid;
    item.quantity = 0;
  }

  startup();
}
