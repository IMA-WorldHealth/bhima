angular.module('bhima.controllers')
  .controller('InventoryListActionsModalController', InventoryListActionsModalController);

InventoryListActionsModalController.$inject = [
  'AccountService', 'InventoryService', 'NotifyService', '$uibModalInstance',
  '$state', 'util', 'appcache', 'SessionService', '$rootScope',
];

function InventoryListActionsModalController(
  Account, Inventory, Notify, Instance,
  $state, util, AppCache, SessionService, $rootScope
) {
  var vm = this;
  var cache = AppCache('InventoryList');

  // this is the model
  vm.item = {};
  vm.stateParams = {};
  vm.currencySymbol = SessionService.enterprise.currencySymbol;

  cache.stateParams = $state.params;
  vm.stateParams = cache.stateParams;

  if ($state.params.uuid || $state.params.creating) {
    cache.stateParams = $state.params;
    vm.stateParams = cache.stateParams;
  } else {
    vm.stateParams = cache.stateParams;
  }

  // this is the UUID of the update state.
  vm.identifier = vm.stateParams.uuid;
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
    var record;
    var promise;
    var message;

    if (form.$invalid) { return null; }

    record = util.filterFormElements(form, true);

    // if no changes were made, simply dismiss the modal
    if (util.isEmptyObject(record)) { return cancel(); }

    promise = vm.isCreateState ?
      Inventory.create(record) :
      Inventory.update(vm.identifier, record);

    return promise
      .then(handleAction)
      .catch(Notify.handleError);

    function handleAction(res) {
      message = vm.isCreateState ? 'FORM.INFO.CREATE_SUCCESS' : 'FORM.INFO.UPDATE_SUCCESS';

      $rootScope.$broadcast('INVENTORY_UPDATED');

      Notify.success(message);

      // if we are supposed to create another item, just refresh the state
      if (vm.createAnotherItem) {
        vm.item = {};
        form.$setPristine();
        return;
      }

      // pass back the uuid
      Instance.close(res.uuid);
    }
  }

  /** cancel action */
  function cancel() {
    Instance.dismiss();
  }

  /** startup */
  function startup() {
    // Inventory Group
    Inventory.Groups.read()
      .then(function handleGroup(groups) {
        vm.groups = groups;
      })
      .catch(Notify.handleError);

    // Inventory Type
    Inventory.Types.read()
      .then(function handleType(types) {
        vm.types = types;
      })
      .catch(Notify.handleError);

    // Inventory Unit
    Inventory.Units.read()
      .then(function handleUnit(units) {
        vm.units = units;
      })
      .catch(Notify.handleError);

    // if we are in the update state, load the inventory item information
    if (vm.isUpdateState) {
      Inventory.read(vm.identifier)
        .then(function handleInventoryItem(item) {
          vm.item = item;
        })
        .catch(Notify.handleError);
    }
  }
}
