angular.module('bhima.controllers')
  .controller('FunctionBonusModalController', FunctionBonusModalController);

FunctionBonusModalController.$inject = [
  'data', '$state', 'FunctionBonusService',
  'NotifyService', '$uibModalInstance',
];

function FunctionBonusModalController(data, $state, FunctionBonus, Notify, Instance) {
  const vm = this;
  vm.close = Instance.close;
  vm.submit = submit;
  vm.item = {};

  vm.isCreate = !data.uuid;
  vm.action = vm.isCreate ? 'FORM.LABELS.CREATE' : 'FORM.LABELS.UPDATE';

  init();

  vm.onInputTextChange = (key, value) => {
    vm.item[key] = value;
  };

  vm.onSelectFonction = function onSelectFonction(fonction) {
    vm.item.fonction_id = fonction.id;
  };

  function init() {
    if (!vm.isCreate) {
      FunctionBonus.read(data.uuid).then(item => {
        vm.item = item;
      }).catch(Notify.handleError);
    }
  }

  function submit(form) {
    if (form.$invalid) {
      Notify.danger('FORM.ERRORS.HAS_ERRORS');
      return false;
    }

    const operation = (!data.uuid)
      ? FunctionBonus.create(vm.item)
      : FunctionBonus.update(data.uuid, vm.item);

    return operation
      .then(() => {
        Notify.success('FORM.INFO.OPERATION_SUCCESS');
        return Instance.close(true);
      })
      .catch(Notify.handleError);
  }
}
