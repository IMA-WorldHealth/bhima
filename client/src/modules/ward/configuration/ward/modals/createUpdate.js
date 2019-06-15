angular.module('bhima.controllers')
  .controller('CreateUpdateWardController', CreateUpdateWardController);

CreateUpdateWardController.$inject = [
  'uuid', 'SessionService', 'WardService',
  'ModalService', 'NotifyService', '$uibModalInstance',
  'ServiceService',
];

function CreateUpdateWardController(uuid, Session, Ward, ModalService, Notify, Instance, Service) {
  const vm = this;
  vm.close = close;

  vm.ward = {};
  vm.submit = submit;
  vm.isCreating = !uuid;
  vm.onSelectService = onSelectService;

  init();

  function init() {
    Service.read()
      .then(services => {
        vm.services = services;
      })
      .catch(Notify.handleError);

    if (!vm.isCreating) {
      Ward.read(uuid)
        .then(ward => {
          vm.ward = ward;
        })
        .catch(Notify.handleError);
    }
  }

  function onSelectService(service) {
    vm.ward.service_id = service.id;
  }

  // create or update a Ward
  function submit(form) {
    if (form.$invalid) {
      Notify.danger('FORM.ERRORS.HAS_ERRORS');
      return false;
    }

    const operation = vm.isCreating ? Ward.create(vm.ward) : Ward.update(uuid, vm.ward);

    return operation
      .then(() => {
        Notify.success('FORM.INFO.OPERATION_SUCCESS');
        return Instance.close(true);
      })
      .catch(Notify.handleError);
  }

  // just close the modal
  function close() {
    return Instance.close();
  }

}
