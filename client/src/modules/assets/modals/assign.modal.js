angular.module('bhima.controllers')
  .controller('AssetAssignmentModalController', AssetAssignmentModalController);

// dependencies injections
AssetAssignmentModalController.$inject = [
  'appcache', '$state', 'data',
  'DepotService', 'NotifyService', '$uibModalInstance',
  'StockService', 'util', 'ReceiptModal',
];

function AssetAssignmentModalController(AppCache, $state, data, Depots, Notify, Modal, Stock, Util, Receipts) {
  const vm = this;
  const cache = AppCache('stock-assign-grid');

  // global variables
  vm.model = {
    quantity : 1,
    lot_uuid : data.uuid,
  };

  vm.selectedInventory = null;
  vm.availableInventories = [];
  vm.availableLots = [];
  vm.stateParams = {};

  cache.stateParams = $state.params;
  vm.stateParams = cache.stateParams;

  if ($state.params.uuid || $state.params.creating) {
    cache.stateParams = $state.params;
    vm.stateParams = cache.stateParams;
  } else {
    vm.stateParams = cache.stateParams;
  }

  vm.onSelectDepot = onSelectDepot;
  function onSelectDepot(depot) {
    vm.inventory_uuid = null;
    vm.model.lot_uuid = null;
    vm.model.quantity = 1;

    vm.model.depot_uuid = depot.uuid;

    loadAvailableInventories(depot.uuid);
  }

  vm.onSelectInventory = onSelectInventory;
  function onSelectInventory(inventory) {
    vm.model.lot_uuid = null;
    vm.model.quantity = 1;

    vm.availableLots = vm.globalAvailableLots.filter(item => item.inventory_uuid === inventory.inventory_uuid);
    if (vm.availableLots.length === 1) {
      vm.model.lot_uuid = vm.availableLots[0].uuid;
    }
  }

  vm.onSelectEntity = onSelectEntity;
  function onSelectEntity(entity) {
    vm.model.entity_uuid = entity.uuid;
  }

  vm.onSelectLot = onSelectLot;
  function onSelectLot(lot) {
    vm.maxQuantityLot = lot.quantity;
  }

  vm.cancel = Modal.close;

  vm.submit = form => {
    if (form.$invalid) { return; }

    const record = Util.filterFormElements(form, true);

    // if no changes were made, simply dismiss the modal
    if (Util.isEmptyObject(record)) {
      Modal.close();
      return;
    }

    Stock.stockAssign.create(vm.model)
      .then(res => {
        Receipts.stockAssignmentReceipt(res.uuid, true);
        Modal.close(true);
      })
      .catch(Notify.handleError);
  };

  function startup() {
    Depots.read(null)
      .then(rows => {
        vm.depots = rows;
      })
      .catch(Notify.handleError);

    if (data.depot_uuid) {
      vm.model.depot_uuid = data.depot_uuid;
      loadAvailableInventories(data.depot_uuid)
        .then(() => {
          if (data.inventory_uuid) {
            vm.selectedInventory = vm.availableInventories.find(elt => elt.inventory_uuid === data.inventory_uuid);
            vm.inventory_uuid = data.inventory_uuid;
            onSelectInventory(vm.selectedInventory);
          }
        });
    }


  }

  /**
   * Load inventories and lots of the given depot which are not assigned
   * for being used in a new assignment
   *
   * @param {string} depotUuid
   */
  function loadAvailableInventories(depotUuid) {
    if (!depotUuid) { return 0; }

    // load available inventories of the given depot
    return Stock.lots.read(null, { depot_uuid: depotUuid, is_assigned: 0, includeEmptyLot: 0 })
      .then(rows => {
        computeAvailableInventories(rows);
        return vm.availableInventories;
      });
  }

  /**
   * Since data contains inventories and lots that we need, we do not want to
   * perform others queries to the server, so we extract inventories and lots
   * from the data given
   * @param {array} invData
   */
  function computeAvailableInventories(invData) {
    vm.globalAvailableLots = invData;
    vm.groupedInventories = Util.groupBy(invData, 'inventory_uuid');
    const uniqueInventoriesUuids = Util.uniquelize(invData.map(item => item.inventory_uuid));
    vm.availableInventories = uniqueInventoriesUuids.map(inventoryUuid => vm.groupedInventories[inventoryUuid][0]);
    vm.availableInventories.forEach(item => {
      item.hrLabel = `[${item.code}] ${item.text}`;
    });
  }

  startup();
}
