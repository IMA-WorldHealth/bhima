angular.module('bhima.controllers')
  .controller('ServiceModalController', ServiceModalController);

ServiceModalController.$inject = [
  '$state', 'ServiceService', 'DepotService', '$translate',
  'SessionService', 'ModalService', 'util', 'NotifyService',
];

function ServiceModalController($state, Services, Depots, $translate,
  SessionService, ModalService, util, Notify) {
  const vm = this;
  const paramService = $state.params.service || {};

  vm.service = {
    id : paramService.id,
    name : paramService.name,
    hidden : paramService.hidden,
    project_id : paramService.project_id,
  };
  vm.isCreating = !!($state.params.creating);

  // exposed methods
  vm.submit = submit;
  vm.closeModal = closeModal;

  vm.onSelectProject = project => {
    vm.service.project_id = project.id;
  };

  // submit the data to the server from all two forms (update, create)
  function submit(serviceForm) {
    if (serviceForm.$invalid || serviceForm.$pristine) { return 0; }

    const promise = (vm.isCreating)
      ? Services.create(vm.service)
      : Services.update(vm.service.uuid, vm.service);

    return promise
      .then(() => {
        const translateKey = (vm.isCreating) ? 'SERVICE.CREATED' : 'SERVICE.UPDATED';
        Notify.success(translateKey);
        $state.go('services', null, { reload : true });
      })
      .catch(Notify.handleError);
  }

  function closeModal() {
    $state.go('services');
  }
}
