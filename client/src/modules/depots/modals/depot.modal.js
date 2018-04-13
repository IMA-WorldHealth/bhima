angular.module('bhima.controllers')
  .controller('DepotModalController', DepotModalController);

DepotModalController.$inject = [
  '$state', 'DepotService', 'ModalService', 'NotifyService',
];

function DepotModalController($state, Depots, ModalService, Notify) {
  const vm = this;

  vm.depot = $state.params.depot;
  vm.isCreating = !!($state.params.creating);

  if (vm.depot.location_uuid) {
    vm.hasLocation = 1;
  }

  // exposed methods
  vm.submit = submit;
  vm.closeModal = closeModal;

  // submit the data to the server from all two forms (update, create)
  function submit(depotForm) {
    if (depotForm.$invalid || depotForm.$pristine) { return 0; }

    Depots.clean(vm.depot);

    if (vm.hasLocation === 0) {
      vm.depot.location_uuid = null;
    }

    const promise = (vm.isCreating) ?
      Depots.create(vm.depot) :
      Depots.update(vm.depot.uuid, vm.depot);

    return promise
      .then(() => {
        const translateKey = (vm.isCreating) ? 'DEPOT.CREATED' : 'DEPOT.UPDATED';
        Notify.success(translateKey);
        $state.go('depots', null, { reload : true });
      })
      .catch(Notify.handleError);
  }

  function closeModal() {
    $state.go('depots');
  }
}
