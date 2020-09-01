angular.module('bhima.controllers')
  .controller('CreateUpdateTypeController', CreateUpdateTypeController);

CreateUpdateTypeController.$inject = [
  'data', 'LocationService', 'NotifyService', '$uibModalInstance', 'ColorService', 'SurveyFormService',
];

function CreateUpdateTypeController(data, Location, Notify, Instance, Color, SurveyForm) {
  const vm = this;
  vm.close = Instance.close;
  vm.submit = submit;
  vm.check = true;

  vm.type = angular.copy(data);

  vm.isCreate = !vm.type.id;
  vm.colors = Color.list;
  vm.isFixed = vm.type.fixed;
  vm.checkVariableName = checkVariableName;
  vm.onSelectColor = onSelectColor;

  function onSelectColor(color) {
    vm.type.color = color.value;
  }

  vm.action = vm.isCreate ? 'FORM.LABELS.CREATE' : 'FORM.LABELS.UPDATE';

  function checkVariableName() {
    if (vm.type.label_name) {
      vm.check = SurveyForm.validVariable(vm.type.label_name);
    }
  }

  function submit(form) {
    if (form.$invalid) {
      return false;
    }

    const labelKey = !vm.type.fixed ? vm.type.typeLabel : vm.type.translation_key;

    const formatedType = {
      translation_key : labelKey,
      color :  vm.type.color,
      is_leaves : vm.type.is_leaves,
      label_name : vm.type.label_name,
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
