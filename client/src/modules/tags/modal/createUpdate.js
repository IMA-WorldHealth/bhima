angular.module('bhima.controllers')
  .controller('TagsModalController', TagsModalController);

TagsModalController.$inject = [
  'data', 'TagService', 'NotifyService',
  '$uibModalInstance', '$rootScope', 'ColorService',
];

function TagsModalController(
  data, TagsService, Notify, Instance, $rootScope, Colors,
) {
  const vm = this;
  vm.colors = Colors.list.map(e => {
    e.iconColor = { color : e.value, 'font-size' : '14px' };
    return e;
  });
  vm.close = Instance.close;
  vm.submit = submit;

  vm.tags = data ? angular.copy(data) : {};
  vm.isCreation = !vm.tags.uuid;
  vm.action = vm.isCreation ? 'FORM.LABELS.CREATE' : 'FORM.LABELS.UPDATE';

  function submit(form) {
    if (form.$invalid) {
      return false;
    }

    if (typeof (vm.tags) === 'object') {
      delete vm.tags.iconColor;
    } else if (Array.isArray(vm.tags)) {
      vm.tags.forEach(t => {
        delete t.iconColor;
      });
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
