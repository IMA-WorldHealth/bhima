angular.module('bhima.controllers')
  .controller('DonorAddController', DonorAddController);

DonorAddController.$inject = [
  'data', '$state', 'DonorService', 'NotifyService', '$uibModalInstance',
];

function DonorAddController(data, $state, DonorService, Notify, $uibModalInstance) {
  const vm = this;
  vm.close = $uibModalInstance.close;
  vm.submit = submit;

  vm.donor = angular.copy(data);
  vm.isCreate = !vm.donor.uid;
  vm.action = vm.isCreate ? 'FORM.LABELS.CREATE' : 'FORM.LABELS.UPDATE';

  function submit(form) {
    if (form.$invalid) {
      Notify.danger('FORM.ERRORS.HAS_ERRORS');
      return false;
    }

    const operation = (!data.id)
      ? DonorService.create(vm.donor)
      : DonorService.update(data.id, vm.donor);

    return operation
      .then(() => {
        Notify.success('FORM.INFO.OPERATION_SUCCESS');
        $state.reload();
        vm.close();
      })
      .catch(Notify.handleError);

  }
}
