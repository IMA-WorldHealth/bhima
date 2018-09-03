angular.module('bhima.controllers')
  .controller('RolesAddController', RolesAddController);

RolesAddController.$inject = [
  'data', '$state', 'RolesService', 'NotifyService', '$uibModalInstance',
];

function RolesAddController(data, $state, RolesService, Notify, $uibModalInstance) {
  const vm = this;
  vm.close = $uibModalInstance.close;
  vm.submit = submit;

  vm.role = angular.copy(data);
  vm.isCreate = !vm.role.uuid;
  vm.action = vm.isCreate ? 'FORM.LABELS.CREATE' : 'FORM.LABELS.UPDATE';

  function submit(form) {
    if (form.$invalid) {
      return false;
    }

    const operation = (!data.uuid)
      ? RolesService.create(vm.role)
      : RolesService.update(data.uuid, vm.role);

    return operation
      .then(() => {
        Notify.success('FORM.INFO.OPERATION_SUCCESS');
        $state.reload();
        vm.close();
      })
      .catch(Notify.handleError);

  }
}
