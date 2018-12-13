angular.module('bhima.controllers')
  .controller('CreateUpdatePavillionController', CreateUpdatePavillionController);

CreateUpdatePavillionController.$inject = [
  'uuid', 'SessionService', 'PavillionService',
  'ModalService', 'NotifyService', '$uibModalInstance',
  'ServiceService',
];

function CreateUpdatePavillionController(uuid, Session, Pavillion, ModalService, Notify, Instance, Service) {
  const vm = this;
  vm.close = close;

  vm.pavillion = {};
  vm.submit = submit;
  vm.isCreating = !uuid;

  init();

  function init() {
    Service.read().then(services => {
      vm.services = services;
    });

    if (!vm.isCreating) {
      Pavillion.read(uuid).then(pavillion => {
        vm.pavillion = pavillion;
      });
    }
  }

  // create or update a Pavillion
  function submit(form) {
    if (form.$invalid) {
      Notify.danger('FORM.ERRORS.HAS_ERRORS');
      return false;
    }

    const operation = vm.isCreating ? Pavillion.create(vm.pavillion) : Pavillion.update(uuid, vm.pavillion);

    return operation.then(() => {
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
