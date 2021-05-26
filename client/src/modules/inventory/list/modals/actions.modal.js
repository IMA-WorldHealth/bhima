angular.module('bhima.controllers')
  .controller('InventoryListActionsModalController', InventoryListActionsModalController);

InventoryListActionsModalController.$inject = [
  'AccountService', 'InventoryService', 'NotifyService', '$uibModalInstance',
  '$state', 'util', 'appcache', 'SessionService', '$rootScope', 'params',
];

function InventoryListActionsModalController(
  Account, Inventory, Notify, Instance, $state,
  util, AppCache, SessionService, $rootScope, params,
) {
  const vm = this;
  const cache = AppCache('InventoryList');

  // this is the model
  vm.item = { sellable : 1, tags : [] };
  vm.stateParams = {};
  vm.currencySymbol = SessionService.enterprise.currencySymbol;

  cache.stateParams = params;
  vm.stateParams = cache.stateParams;

  if (params.uuid || params.isCreateState) {
    cache.stateParams = params;
    vm.stateParams = cache.stateParams;
  } else {
    vm.stateParams = cache.stateParams;
  }

  // this is the UUID of the update state.
  vm.identifier = vm.stateParams.uuid;
  vm.isUpdateState = angular.isDefined(vm.identifier);
  vm.isCreateState = !angular.isDefined(vm.identifier);

  // toggle for isCreateState multiple inventory items at once
  vm.createAnotherItem = false;

  // expose to the view
  vm.submit = submit;
  vm.cancel = cancel;
  vm.onSelectTags = onSelectTags;

  // startup
  startup();

  /** on select tags */
  function onSelectTags(tags) {
    vm.item.tags = tags;
  }

  /** submit data */
  function submit(form) {
    if (form.$invalid) { return null; }

    const record = util.filterFormElements(form, true);

    if (vm.item) {
      record.tags = vm.item.tags;
    }

    // if no changes were made, simply dismiss the modal
    if (util.isEmptyObject(record)) { return cancel(); }

    const promise = vm.isCreateState
      ? Inventory.create(record)
      : Inventory.update(vm.identifier, record);

    return promise
      .then(handleAction)
      .catch(Notify.handleError);

    function handleAction(res) {
      const message = vm.isCreateState ? 'FORM.INFO.CREATE_SUCCESS' : 'FORM.INFO.UPDATE_SUCCESS';

      // if we are supposed to create another item, just refresh the state
      if (vm.createAnotherItem) {
        vm.item = {};
        form.$setPristine();
        $rootScope.$broadcast('INVENTORY_UPDATED');
        Notify.success(message);
        return;
      }

      // pass back the uuid
      Instance.close(res.uuid);

      Notify.success(message);
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
      .then((groups) => {
        vm.groups = groups;
      })
      .catch(Notify.handleError);

    // Inventory Type
    Inventory.Types.read()
      .then((types) => {
        vm.types = types;
      })
      .catch(Notify.handleError);

    // Inventory Unit
    Inventory.Units.read()
      .then((units) => {
        vm.units = units;
      })
      .catch(Notify.handleError);

    // if we are in the update state, load the inventory item information
    if (vm.isUpdateState) {
      Inventory.read(vm.identifier)
        .then((item) => {
          vm.item = item;
        })
        .catch(Notify.handleError);
    }
  }
}
