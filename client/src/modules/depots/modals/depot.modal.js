angular.module('bhima.controllers')
  .controller('DepotModalController', DepotModalController);

DepotModalController.$inject = [
  '$state', 'DepotService', 'NotifyService', 'SessionService',
];

function DepotModalController($state, Depots, Notify, Session) {
  const vm = this;

  vm.depot = $state.params.depot;

  vm.isCreating = !!($state.params.creating);

  // make sure hasLocation is set
  if (vm.depot) {
    vm.hasLocation = vm.depot.location_uuid ? 1 : 0;
    vm.mainDepot = vm.depot.parent ? 1 : 0;
  }

  if ($state.params.parentId) {
    vm.mainDepot = 1;
    vm.depot.parent = $state.params.parentId;
  }

  // If creating, insert the default min_months_security_stock
  if (vm.isCreating) {
    vm.depot.min_months_security_stock = Session.enterprise.settings.default_min_months_security_stock;
  }

  // exposed methods
  vm.submit = submit;

  vm.onSelectDepot = depot => {
    vm.depot.parent = depot.uuid;
  };

  // submit the data to the server from all two forms (update, create)
  function submit(depotForm) {
    if (depotForm.$invalid) {
      return 0;
    }

    if (depotForm.$pristine) {
      cancel();
      return 0;
    }

    Depots.clean(vm.depot);

    if (vm.hasLocation === 0) {
      vm.depot.location_uuid = null;
    }

    if (vm.mainDepot === 0) {
      vm.depot.parent = 0;
    }

    const promise = (vm.isCreating)
      ? Depots.create(vm.depot)
      : Depots.update(vm.depot.uuid, vm.depot);

    return promise
      .then(() => {
        const translateKey = (vm.isCreating) ? 'DEPOT.CREATED' : 'DEPOT.UPDATED';
        Notify.success(translateKey);
        $state.go('depots', null, { reload : true });
      })
      .catch(Notify.handleError);
  }

  function cancel() {
    $state.go('depots');
  }
}
