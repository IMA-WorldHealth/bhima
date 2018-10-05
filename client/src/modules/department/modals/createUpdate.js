angular.module('bhima.controllers')
  .controller('CreateUpdateDepartmentController', CreateUpdateDepartmentController);

CreateUpdateDepartmentController.$inject = [
  'uuid', 'SessionService', 'DepartmentService',
  'ModalService', 'NotifyService', '$uibModalInstance',
];

function CreateUpdateDepartmentController(uuid, Session, Department, ModalService, Notify, Instance) {
  const vm = this;
  vm.close = close;

  vm.department = {};
  vm.submit = submit;
  const { enterprise } = Session;
  vm.isCreating = !uuid;

  init();

  function init() {
    if (!vm.isCreating) {
      Department.detail(uuid).then(department => {
        vm.department = department;
      });
    }
  }

  // create or update a department
  function submit(form) {
    if (form.$invalid) {
      Notify.danger('FORM.ERRORS.HAS_ERRORS');
      return false;
    }
    vm.department.enterprise_id = enterprise.id;
    const operation = vm.isCreating ? Department.create(vm.department) : Department.update(uuid, vm.department);

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
