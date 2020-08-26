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
  vm.colors = Colors.list.map(addIconStyle);
  vm.close = Instance.close;
  vm.submit = submit;

  vm.tags = data ? angular.copy(data) : {};
  vm.isCreation = !vm.tags.uuid;
  vm.action = vm.isCreation ? 'FORM.LABELS.CREATE' : 'FORM.LABELS.UPDATE';

  function addIconStyle(item) {
    item.style = { color : item.value };
    return item;
  }

  function submit(form) {
    if (form.$invalid) {
      return false;
    }

    [].concat(vm.tags).forEach(tag => {
      delete tag.style;
    });

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
