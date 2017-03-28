angular.module('bhima.controllers')
  .controller('InventoryListActionsModalController', InventoryListActionsModalController);

InventoryListActionsModalController.$inject = [
  'AccountService', 'InventoryService','NotifyService',
  '$uibModalInstance', '$state', 'util'
];

function InventoryListActionsModalController(Account, Inventory, Notify, Instance, $state, util) {
  var vm = this;

  // this is the model
  vm.item = {};

  // this is the UUID of the update state.
  vm.identifier = $state.params.uuid;
  vm.isUpdateState = angular.isDefined(vm.identifier);
  vm.isCreateState = !angular.isDefined(vm.identifier);

  // toggle for creating multiple inventory items at once
  vm.createAnotherItem = false;

  // expose to the view
  vm.submit = submit;
  vm.cancel = cancel;

  // startup
  startup();

  /** submit data */
  function submit(form) {
    if (form.$invalid) { return; }

    var record = util.filterFormElements(form, true);

    // if no changes were made, simply dismiss the modal
    if (util.isEmptyObject(record)) {
      cancel();
    }

    var promise = vm.isCreateState ?
      Inventory.create(record) :
      Inventory.update(vm.identifier, record);

    return promise
      .then(function (res) {
        var message = vm.isCreateState ?
          'FORM.INFO.CREATE_SUCCESS' :
          'FORM.INFO.UPDATE_SUCCESS';

        Notify.success(message);

        // if we are supposed to create another item, just refresh the state
        if (vm.createAnotherItem) {
          vm.item = {};
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
    Inventory.Groups.read()
      .then(function (groups) {
        vm.groups = groups;
      })
      .catch(Notify.handleError);

    // Inventory Type
    Inventory.Types.read()
      .then(function (types) {
        vm.types = types;
      })
      .catch(Notify.handleError);

    // Inventory Unit
    Inventory.Units.read()
      .then(function (units) {
        vm.units = units;
      })
      .catch(Notify.handleError);

    // if we are in the update state, load the inventory item information
    if (vm.isUpdateState) {
      Inventory.read(vm.identifier)
        .then(function (item) {
          vm.item = item;
        })
        .catch(Notify.handleError);
    }

  }
}
