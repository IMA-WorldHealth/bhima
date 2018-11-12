angular.module('bhima.controllers')
  .controller('TagsModalController', TagsModalController);

TagsModalController.$inject = [
  'data', '$state', 'TagsService', 'NotifyService',
  '$uibModalInstance', '$rootScope',
];

function TagsModalController(data, $state, TagsService, Notify, Instance, $rootScope) {
  const vm = this;
  vm.close = Instance.close;
  vm.submit = submit;

  vm.tags = data ? angular.copy(data) : {};
  vm.isCreation = !vm.tags.uuid;
  vm.action = vm.isCreation ? 'FORM.LABELS.CREATE' : 'FORM.LABELS.UPDATE';

  function submit(form) {
    if (form.$invalid) {
      return false;
    }

    const operation = vm.isCreation
      ? TagsService.create(vm.tags)
      : TagsService.update(data.uuid, vm.tags);

    return operation
      .then(() => {
        Notify.success('FORM.INFO.OPERATION_SUCCESS');
        $rootScope.$broadcast('TAGS_CHANGED', true);
        vm.close();
      })
      .catch(Notify.handleError);

  }
}
