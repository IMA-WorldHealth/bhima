angular.module('bhima.controllers')
  .controller('DepotModalController', DepotModalController);

DepotModalController.$inject = [
  '$state', 'DepotService', 'NotifyService', 'SessionService',
];

function DepotModalController($state, Depots, Notify, Session) {
  const vm = this;

  vm.depot = $state.params.depot;
  vm.clear = clear;

  vm.isCreating = !!($state.params.creating);

  // make sure hasLocation is set
  if (vm.depot) {
    if (vm.depot.parent === 0) {
      delete vm.depot.parent_uuid;
    }

    vm.hasLocation = vm.depot.location_uuid ? 1 : 0;
  }

  if ($state.params.parentId) {
    vm.depot.parent_uuid = $state.params.parentId;
  }

  // If creating, insert the default min_months_security_stock
  if (vm.isCreating) {
    vm.depot.min_months_security_stock = Session.enterprise.settings.default_min_months_security_stock;
  }

  function clear(element) {
    delete vm.depot[element];

    // This is a trick just to mark the modification of the formula,
    // because when deleting the parent repository,
    // the form does not seem to be modified.
    vm.clearParent = true;
  }

  // exposed methods
  vm.submit = submit;

  vm.onSelectDepot = depot => {
    if (depot.uuid === '0') {
      depot.uuid = null;
    }

    vm.depot.parent_uuid = depot.uuid;
  };

  // submit the data to the server from all two forms (update, create)
  function submit(depotForm) {
    if (depotForm.$invalid) {
      return 0;
    }

    if (depotForm.$pristine && !vm.clearParent) {
      cancel();
      return 0;
    }

    Depots.clean(vm.depot);

    if (vm.hasLocation === 0) {
      vm.depot.location_uuid = null;
    }

    if (!vm.depot.parent_uuid) {
      vm.depot.parent_uuid = 0;
    }

    // Delete element parent
    delete vm.depot.parent;

    const promise = (vm.isCreating)
      ? Depots.create(vm.depot)
      : Depots.update(vm.depot.uuid, vm.depot);

    return promise
      .then(() => {
        const translateKey = (vm.isCreateState) ? 'DEPOT.CREATED' : 'DEPOT.UPDATED';
        Notify.success(translateKey);
        $state.go('depots', null, { reload : true });
      })
      .catch(Notify.handleError);
  }

  function cancel() {
    $state.go('depots');
  }
}
