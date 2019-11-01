angular.module('bhima.controllers')
  .controller('ActionRequisitionModalController', ActionRequisitionModalController);

// dependencies injections
ActionRequisitionModalController.$inject = [
  'appcache', '$state', 'Store', 'InventoryService',
  'DepotService', 'NotifyService', '$uibModalInstance',
  'StockService', 'ReceiptModal',
];

function ActionRequisitionModalController(
  AppCache, $state, Store, Inventories, Depots, Notify, Modal, Stock, Receipts
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
  ];

  vm.gridOptions = {
    appScopeProvider : vm,
    enableColumnMenus : false,
    columnDefs : columns,
    enableSorting : true,
    fastWatch : true,
    flatEntityAccess : true,
  };

  // global methods
  vm.model = {};
  vm.addItem = addItem;
  vm.configureItem = configureItem;

  vm.onSelectDepot = onSelectDepot;
  function onSelectDepot(depot) {
    vm.model.depot_uuid = depot.uuid;
  }

  vm.onSelectRequestor = onSelectRequestor;
  function onSelectRequestor(requestor) {
    vm.model.requestor_type_id = requestor.requestor_type_id;
    vm.model.requestor_uuid = requestor.uuid;
  }

  vm.cancel = Modal.close;

  vm.submit = form => {
    if (form.$invalid) { return null; }

    const items = store.data.map(getItem);

    if (!items.length) { return null; }

    angular.extend(vm.model, { items });

    return Stock.stockRequisition.create(vm.model)
      .then(res => {
        vm.lockSubmission = true;
        Receipts.stockRequisitionReceipt(res.uuid, true);
        Modal.close(true);
      })
      .catch(Notify.handleError);
  };

  function getItem(row) {
    return {
      inventory_uuid : row.inventory_uuid,
      quantity : row.quantity,
    };
  }

  function startup() {
    loadInventories();

    Depots.read(null)
      .then(rows => {
        vm.depots = rows;
      })
      .catch(Notify.handleError);
  }

  /**
   * loadInventories
   */
  function loadInventories() {
    Inventories.read()
      .then(rows => {
        vm.selectableInventories = rows;
      })
      .catch(Notify.handleError);
  }

  /**
   * add requisition item
   */
  function addItem(n) {
    let i = n;

    while (i--) {
      const row = { id : store.data.length };
      store.post(row);
    }

    // update the grid
    vm.gridOptions.data = store.data;
  }

  /**
   * configure requisition item
   */
  function configureItem(item) {
    item._initialised = true;
    item.inventory_uuid = item.inventory.uuid;
    item.quantity = 0;
  }

  startup();
}
