angular.module('bhima.controllers')
  .controller('InventoryListActionsModalController', InventoryListActionsModalController);

InventoryListActionsModalController.$inject = [
  'AccountService', 'InventoryService', 'InventoryGroupService',
  'InventoryTypeService', 'InventoryUnitService', 'NotifyService',
  '$uibModalInstance', 'Store', '$state', '$q'
];

function InventoryListActionsModalController(Account, Inventory, InventoryGroup, InventoryType, InventoryUnit, Notify, Instance, Store, $state, $q) {
  var vm = this;
  var item = vm.item = {};

  // this is the UUID of the update state.
  vm.identifier = $state.params.uuid;
  vm.isUpdateState = angular.isDefined(vm.identifier);
  vm.isCreateState = !angular.isDefined(vm.identifier);

  // toggle for creating multiple inventory items at once
  vm.createAnotherItem = false;

  // variables for storage
  var GroupStore = {};
  var TypeStore  = {};
  var UnitStore  = {};

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

    return promise
      .then(function (res) {
        var message = vm.isCreateState ?
          'FORM.INFO.CREATE_SUCCESS' :
          'FORM.INFO.UPDATE_SUCCESS';

        Notify.success(message);

        if (vm.createAnotherItem) {
          item = vm.item = {};
          return;
        }

        // pass back the uuid
        Instance.close(res.uuid);
      })
      .catch(Notify.handleError);
  }

  /** cancel action */
  function cancel() {
    Instance.dismiss();
  }

  /** startup */
  function startup() {

    // Inventory Group
    var inventoryGroupPromise = InventoryGroup.read()
      .then(function (list) {
        vm.inventoryGroupList = list;
        GroupStore = new Store({ identifier: 'uuid', data: vm.inventoryGroupList });
      });

    // Inventory Group
    var inventoryTypePromise = InventoryType.read()
      .then(function (list) {
        vm.inventoryTypeList = list;
        TypeStore = new Store({ data: vm.inventoryTypeList });
      });

    var inventoryUnitPromise = InventoryUnit.read()
      .then(function (list) {
        vm.inventoryUnitList = list;
        UnitStore = new Store({ data: vm.inventoryUnitList });
      });

    $q.all([ inventoryGroupPromise, inventoryTypePromise, inventoryUnitPromise ])
      .then(function () {

        // if we are in the update state, load the appropriate information
        if (vm.isUpdateState) {
          return Inventory.read(vm.identifier)
            .then(function (item) {
              vm.item = item;
              vm.item.group = GroupStore.get(vm.item.group_uuid);
              vm.item.type  = TypeStore.get(vm.item.type_id);
              vm.item.unit = UnitStore.get(vm.item.unit_id);
            });
        }
      })
      .catch(Notify.handleError);
  }
}
