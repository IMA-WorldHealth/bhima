angular.module('bhima.controllers')
  .controller('DepotModalController', DepotModalController);

DepotModalController.$inject = [
  '$state', 'DepotService', 'NotifyService',
];

function DepotModalController($state, Depots, Notify) {
  const vm = this;

  vm.depot = $state.params.depot;

  vm.isCreating = !!($state.params.creating);

  // make sure hasLocation is set
  if (vm.depot) {
    vm.hasLocation = vm.depot.location_uuid ? 1 : 0;
  }

  // exposed methods
  vm.onSelectLocation = onSelectLocation;
  vm.submit = submit;

  function onSelectLocation(location) {
    vm.depot.location_uuid = location.uuid;
  }

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

    delete vm.depot.location_id;
    delete vm.depot.location_name;
    delete vm.depot.location_parent_name;

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
