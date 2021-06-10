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
  vm.isCreateState = true;

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

  vm.model = { date : new Date() };

  vm.addItem = addItem;
  vm.removeItem = removeItem;
  vm.configureItem = configureItem;
  vm.autoSuggestInventories = autoSuggestInventories;
  vm.cancel = cancel;

  vm.onSelectDepot = depot => {
    vm.model.depot_uuid = depot.uuid;
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

  if (data.uuid) {
    vm.requisitionUuid = data.uuid;
    vm.isCreateState = false;

    Stock.stockRequisition.read(data.uuid)
      .then((requisionData) => {
        console.log('requisitionData:', requisionData)
        requisionData.items.forEach((item, index) => {
          addItem(1, {
            _initialised : true,
            id : index,
            inventory_uuid : item.inventory_uuid,
            code : item.code,
            S_Q : item.quantity,
            quantity : item.quantity,
            inventory_label : item.text,
            uuid : item.inventory_uuid,
          });
        });

        vm.model = requisionData;
        vm.model.date = new Date(vm.model.date);
      })
      .catch(Notify.handleError);
  }

  vm.submit = form => {
    if (form.$invalid) { return null; }

    const items = store.data.map(getItem);

    if (!items.length) { return null; }

    angular.extend(vm.model, { items });

    const updateElement = {
      date : new Date(vm.model.date),
      depot_uuid : vm.model.depot_uuid,
      description : vm.model.description,
      items : vm.model.items,
      project_id : vm.model.project_id,
      requestor_type_id : vm.model.requestor_type_id,
      requestor_uuid : vm.model.requestor_uuid,
      user_id : vm.model.user_id,
    };

    const promise = (vm.isCreateState)
      ? Stock.stockRequisition.create(vm.model)
      : Stock.stockRequisition.update(vm.requisitionUuid, updateElement);

    return promise
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
        item.label = item.text;
        row._initialised = true;
        row.inventory = item;
        row.inventory_uuid = item.inventory_uuid;
        row.quantity = item.S_Q;

        if (item.inventory_label) {
          row.inventory.label = item.inventory_label;
        }
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
