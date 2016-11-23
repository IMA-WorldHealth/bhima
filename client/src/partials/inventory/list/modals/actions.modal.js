angular.module('bhima.controllers')
.controller('InventoryListActionsModalController', InventoryListActionsModalController);

InventoryListActionsModalController.$inject = [
  'AccountService', 'InventoryService', 'InventoryGroupService',
  'InventoryTypeService', 'InventoryUnitService', 'NotifyService',
  '$uibModalInstance', 'Store', 'data'
];

function InventoryListActionsModalController(Account, Inventory, InventoryGroup, InventoryType, InventoryUnit, Notify, Instance, Store, Data) {
  var vm = this;
  var item = vm.item = {};

  // variables for storage
  var GroupStore = {};
  var TypeStore  = {};
  var UnitStore  = {};

  vm.isCreateState = Data.action === 'add';
  vm.isEditState = Data.action === 'edit';

  // expose to the view
  vm.submit = submit;
  vm.cancel = cancel;

  // startup
  startup();

  /** submit data */
  function submit(form) {
    if (form.$invalid) { return; }

    var record = Inventory.clean(vm.item);

    var promise = vm.isCreateState ?
      Inventory.create(record) :
      Inventory.update(vm.identifier, record);

    promise
      .then(function (res) {
        var message = vm.isCreateState ?
          'FORM.INFO.CREATE_SUCCESS' :
          'FORM.INFO.UPDATE_SUCCESS';

        Notify.success(message);
        Instance.close(res);
      })
      .catch(Notify.handleError);
  }

  /** cancel action */
  function cancel() {
    Instance.dismiss();
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
    .catch(Notify.handleError);

    // Inventory Group
    InventoryType.read()
    .then(function (list) {
      vm.inventoryTypeList = list;
      TypeStore = new Store({ data: vm.inventoryTypeList });
    })
    .catch(Notify.handleError);

    // Inventory Unit
    InventoryUnit.read()
    .then(function (list) {
      vm.inventoryUnitList = list;
      UnitStore = new Store({ data: vm.inventoryUnitList });
    })
    .catch(Notify.handleError);

    if (vm.identifier) {
      Inventory.read(vm.identifier)
        .then(function (item) {
          vm.item = item;
          vm.item.group = GroupStore.get(vm.item.group_uuid);
          vm.item.type  = TypeStore.get(vm.item.type_id);
          vm.item.unit = UnitStore.get(vm.item.unit_id);
        })
        .catch(Notify.handleError);
    }
  }
}
