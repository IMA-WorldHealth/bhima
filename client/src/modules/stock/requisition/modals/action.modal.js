angular.module('bhima.controllers')
  .controller('ActionRequisitionModalController', ActionRequisitionModalController);

// dependencies injections
ActionRequisitionModalController.$inject = [
  'Store', 'InventoryService', 'NotifyService',
  '$uibModalInstance', 'StockService', 'ReceiptModal', 'data',
];

function ActionRequisitionModalController(
  Store, Inventories, Notify, Modal, Stock, Receipts, data,
) {
  const vm = this;
  const store = new Store({ data : [] });
  const columns = [
    {
      field : 'available',
      displayName : '',
      width : 25,
      cellTemplate : 'modules/stock/requisition/templates/available.cell.html',
    },
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

  vm.model = { date : new Date() };

  vm.addItem = addItem;
  vm.removeItem = removeItem;
  vm.configureItem = configureItem;
  vm.autoSuggestInventories = autoSuggestInventories;
  vm.cancel = cancel;
  vm.checkInventoryAvailability = checkInventoryAvailability;

  vm.onSelectDepot = depot => {
    vm.model.depot_uuid = depot.uuid;

    loadAvailableInventories()
      .then(values => {
        vm.supplierInventoriesQuantities = values.supplierInventoriesQuantities;
        vm.availableSupplierInventories = values.availableSupplierInventories;
        handleAvailability();
      })
      .catch(Notify.handleError);
  };

  vm.onDateChange = date => {
    vm.model.date = date;
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

  function loadAvailableInventories() {
    if (!vm.model.depot_uuid) { return {}; }

    return Stock.inventories.read(null, {
      depot_uuid : vm.model.depot_uuid,
      includeEmptyLot : 0,
      consumable : 1,
    })
      .then(inventories => {
        vm.supplierInventoriesQuantities = new Map(inventories.map(i => ([i.inventory_uuid, i.quantity])));
        vm.availableSupplierInventories = inventories.map(i => i.inventory_uuid);
        return {
          supplierInventoriesQuantities : vm.supplierInventoriesQuantities,
          availableSupplierInventories : vm.availableSupplierInventories,
        };
      })
      .catch(Notify.handleError);
  }

  function checkInventoryAvailability(inventory, currentQuantity) {
    if (vm.model.depot_uuid) {
      if (currentQuantity) {
        inventory.quantity = currentQuantity;
      }

      const identifier = vm.enableAutoSuggest ? inventory.inventory_uuid : inventory.uuid;
      const quantity = vm.enableAutoSuggest ? inventory.S_Q : inventory.quantity;

      inventory.isAvailable = !!vm.availableSupplierInventories.includes(identifier);

      if (inventory.isAvailable) {
        inventory.hasEnoughQuantity = !!(vm.supplierInventoriesQuantities.get(identifier) >= quantity);
        inventory.supplierAvailableQuantity = vm.supplierInventoriesQuantities.get(identifier);
      }
    }

    return inventory;
  }

  function handleAvailability() {
    vm.toggleAvailability = true;

    if (!vm.model.depot_uuid) { return; }

    store.data.map(i => checkInventoryAvailability(i.inventory, i.quantity));
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
    // load available supplier inventories if supplier depot defined
    if (vm.model.depot_uuid) {
      loadAvailableInventories()
        .then(values => {
          vm.supplierInventoriesQuantities = values.supplierInventoriesQuantities;
          vm.availableSupplierInventories = values.availableSupplierInventories;
        })
        .catch(Notify.handleError);
    }

    if (data.depot && data.depot.uuid) {
      const DEPOT_REQUESTOR_TYPE = 2;
      const { depot } = data;

      vm.model.requestor_type_id = DEPOT_REQUESTOR_TYPE;
      vm.model.requestor_uuid = depot.uuid;
      // enable auto suggestions only if a depot is selected
      vm.enableAutoSuggest = true;
      autoSuggestInventories();
    }

    Inventories.read(null, { consumable : 1 })
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
        checkInventoryAvailability(item);
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

  function cancel() {
    Modal.dismiss();
  }

  startup();
}
