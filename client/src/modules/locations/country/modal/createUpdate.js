angular.module('bhima.controllers')
  .controller('CreateUpdateCountryController', CreateUpdateCountryController);

CreateUpdateCountryController.$inject = [
  'data', '$state', 'LocationService', 'NotifyService', '$uibModalInstance',
];

function CreateUpdateCountryController(data, $state, Location, Notify, Instance) {
  const vm = this;
  vm.close = Instance.close;
  vm.submit = submit;

  vm.country = angular.copy(data);
  vm.isCreate = !vm.country.uuid;
  vm.action = vm.isCreate ? 'FORM.LABELS.CREATE' : 'FORM.LABELS.UPDATE';

  function submit(form) {
    if (form.$invalid) {
      return false;
    }

    const operation = (!data.uuid)
      ? Location.create.country(vm.country)
      : Location.update.country(data.uuid, vm.country);

    return operation
      .then(() => {
        Notify.success('FORM.INFO.OPERATION_SUCCESS');
        return Instance.close(true);
      })
      .catch(Notify.handleError);
  }
}
