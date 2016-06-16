angular.module('bhima.controllers')
.controller('InventoryListActionsModalController', InventoryListActionsModalController);

InventoryListActionsModalController.$inject = [
  'AccountService', 'InventoryService', 'InventoryGroupService',
  'InventoryTypeService', 'InventoryUnitService', 'NotifyService',
  '$uibModalInstance', 'Store', 'data'
];

function InventoryListActionsModalController(Account, Inventory, InventoryGroup, InventoryType, InventoryUnit, Notify, Instance, Store, Data) {
  var vm = this, session = vm.session = {};

  // variables for storage
  var GroupStore = {},
      TypeStore  = {},
      UnitStore  = {};

  // map for actions
  var map = { 'add' : addList, 'edit' : editList };

  // expose to the view
  vm.submit = submit;
  vm.cancel = cancel;

  // startup
  startup();

  /** submit data */
  function submit(form) {
    if (form.$invalid) {
      return;
    }

    var record = cleanForSubmit(vm.session);
    map[vm.action](record, vm.identifier)
    .then(function (res) {
      Instance.close(res);
    });
  }

  /** add inventory list */
  function addList(record) {
    return Inventory.create(record)
    .then(function (res) {
      return res;
    })
    .catch(Notify.errorHandler);
  }

  /** edit inventory list */
  function editList(record, uuid) {
    return Inventory.update(uuid, record)
    .then(function (res) {
      return res;
    })
    .catch(Notify.errorHandler);
  }

  /** cancel action */
  function cancel() {
    Instance.dismiss();
  }

  /** format data to data structure in the db */
  function cleanForSubmit(session) {
    return {
      uuid        : session.uuid,
      code        : session.code,
      price       : session.price,
      text        : session.label,
      group_uuid  : session.group.uuid,
      unit_id     : session.unit.id,
      type_id     : session.type.id,
      unit_weight : session.unit_weight,
      unit_volume : session.unit_volume,
      consumable  : session.consumable
    };
  }

  /** startup */
  function startup() {
    vm.action = Data.action;
    vm.identifier = Data.identifier;

    // Inventory Group
    InventoryGroup.read()
    .then(function (list) {
      vm.inventoryGroupList = list;
      GroupStore = new Store({ identifier: 'uuid', data: vm.inventoryGroupList });
    })
    .catch(Notify.errorHandler);

    // Inventory Group
    InventoryType.read()
    .then(function (list) {
      vm.inventoryTypeList = list;
      TypeStore = new Store({ data: vm.inventoryTypeList });
    })
    .catch(Notify.errorHandler);

    // Inventory Unit
    InventoryUnit.read()
    .then(function (list) {
      vm.inventoryUnitList = list;
      UnitStore = new Store({ data: vm.inventoryUnitList });
    })
    .catch(Notify.errorHandler);

    if (vm.identifier) {
      Inventory.read(vm.identifier)
      .then(function (list) {
        vm.session = list;
        vm.session.group = GroupStore.get(vm.session.group_uuid);
        vm.session.type  = TypeStore.get(vm.session.type_id);
        vm.session.unit = UnitStore.get(vm.session.unit_id);
      })
      .catch(Notify.errorHandler);
    }

  }

}
