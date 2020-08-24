angular.module('bhima.controllers')
  .controller('CreateUpdateTypeController', CreateUpdateTypeController);

CreateUpdateTypeController.$inject = [
  'data', 'LocationService', 'NotifyService', '$uibModalInstance', 'ColorService',
];

function CreateUpdateTypeController(data, Location, Notify, Instance, Color) {
  const vm = this;
  vm.close = Instance.close;
  vm.submit = submit;

  vm.type = angular.copy(data);

  vm.isCreate = !vm.type.id;
  vm.colors = Color.list;
  vm.isFixed = vm.type.fixed;

  vm.action = vm.isCreate ? 'FORM.LABELS.CREATE' : 'FORM.LABELS.UPDATE';

  function submit(form) {
    if (form.$invalid) {
      return false;
    }

    const labelKey = !vm.type.fixed ? vm.type.typeLabel : vm.type.translation_key;

    const formatedType = {
      translation_key : labelKey,
      color :  vm.type.color,
      is_leaves : vm.type.is_leaves,
    };

    const operation = (!vm.type.id)
      ? Location.create.type(formatedType)
      : Location.update.type(vm.type.id, formatedType);

    return operation
      .then(() => {
        Notify.success('FORM.INFO.OPERATION_SUCCESS');
        return Instance.close(true);
      })
      .catch(Notify.handleError);
  }
}
