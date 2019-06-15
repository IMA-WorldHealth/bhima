angular.module('bhima.controllers')
  .controller('SupplierCreateUpdateController', SupplierCreateUpdateController);

SupplierCreateUpdateController.$inject = [
  'data', '$state', 'SupplierService',
  'NotifyService', '$uibModalInstance',
  'CreditorGroupService',
];

function SupplierCreateUpdateController(data, $state, SupplierService, Notify,
  Instance, CreditorGroups) {
  const vm = this;
  vm.close = Instance.close;
  vm.submit = submit;

  vm.supplier = angular.copy(data);
  vm.isCreate = !vm.supplier.uuid;
  vm.action = vm.isCreate ? 'FORM.LABELS.CREATE' : 'FORM.LABELS.UPDATE';

  init();

  function submit(form) {
    if (form.$invalid) {
      Notify.danger('FORM.ERRORS.HAS_ERRORS');
      return false;
    }

    const operation = (!data.uuid)
      ? SupplierService.create(vm.supplier)
      : SupplierService.update(data.uuid, vm.supplier);

    return operation
      .then(() => {
        Notify.success('FORM.INFO.OPERATION_SUCCESS');
        const message = vm.isCreate ? 'FORM.INFO.CREATE_SUCCESS' : 'FORM.INFO.UPDATE_SUCCESS';
        Notify.success(message);
        return Instance.close(true);
      })
      .catch(Notify.handleError);
  }

  function init() {
    // load Creditors
    CreditorGroups.read().then(groups => {
      vm.groups = groups;
    })
      .catch(Notify.handleError);
  }

  vm.onInputTextChange = (key, value) => {
    vm.supplier[key] = value;
  };

}
