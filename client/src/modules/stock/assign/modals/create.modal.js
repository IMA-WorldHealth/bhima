angular.module('bhima.controllers')
  .controller('CreateAssignModalController', CreateAssignModalController);

// dependencies injections
CreateAssignModalController.$inject = [
  'DepotService', 'NotifyService', '$uibModalInstance',
  'StockService', 'util', 'data',
];

function CreateAssignModalController(Depots, Notify, Modal, Stock, Util) {
  const vm = this;
  vm.model = { quantity : 1 };
  vm.availableInventories = [];
  vm.availableLots = [];

  vm.onSelectDepot = depot => {
    vm.model.depot_uuid = depot.uuid;
    loadAvailableInventories(depot.uuid);
  };

  vm.onSelectInventory = inventory => {
    vm.availableLots = vm.globalAvailableLots.filter(item => item.inventory_uuid === inventory.inventory_uuid);
  };

  vm.onSelectEntity = entity => {
    vm.model.entity_uuid = entity.uuid;
  };

  vm.cancel = Modal.close;

  vm.submit = form => {
    if (form.$invalid) { return; }

    Stock.stockAssign.create(vm.model)
      .then(() => Modal.close(true))
      .catch(Notify.handleError);
  };

  Depots.read(null)
    .then(rows => {
      vm.depots = rows;
    })
    .catch(Notify.handleError);

  function loadAvailableInventories(depotUuid) {
    if (!depotUuid) { return; }

    // load available inventories of the given depot
    Stock.lots.read(null, { depot_uuid : depotUuid, is_assigned : 0 })
      .then(rows => {
        computeAvailableInventories(rows);
      })
      .catch(Notify.handleError);
  }

  function computeAvailableInventories(data) {
    vm.globalAvailableLots = data;
    vm.groupedInventories = groupBy(data, 'inventory_uuid');
    const uniqueInventoriesUuids = Util.uniquelize(data.map(item => item.inventory_uuid));
    vm.availableInventories = uniqueInventoriesUuids.map(inventoryUuid => vm.groupedInventories[inventoryUuid][0]);
  }

  /**
   * @function groupBy
   * @description group an array of objects according a property
   * @param {array} array
   * @param {string} property
   * @returns {object}
   */
  function groupBy(array, property) {
    const out = {};
    for (let i = 0; i < array.length; i++) {
      const item = array[i];
      const value = item[property];
      if (!out[value]) {
        out[value] = [];
      }
      out[value].push(item);
    }
    return out;
  }
}
