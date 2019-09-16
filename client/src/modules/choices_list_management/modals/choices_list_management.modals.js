angular.module('bhima.controllers')
  .controller('ChoicesListManagementModalController', ChoicesListManagementModalController);

ChoicesListManagementModalController.$inject = [
  '$state', 'ChoicesListManagementService', 'NotifyService', 'appcache',
];

/**
 * CHOICES LIST MANAGEMENT Modal Controller
 */

function ChoicesListManagementModalController($state, ChoicesListManagement, Notify, AppCache) {
  const vm = this;
  const cache = AppCache('ChoicesListManagementModal');

  vm.choice = {};
  vm.stateParams = {};

  // exposed methods
  vm.submit = submit;
  vm.closeModal = closeModal;
  vm.clear = clear;
  vm.onSelectParent = onSelectParent;
  vm.onSelectGroup = onSelectGroup;

  if ($state.params.creating || $state.params.id) {
    cache.stateParams = $state.params;
    vm.stateParams = cache.stateParams;
    vm.choice.parent = $state.params.parentId;
  } else {
    vm.stateParams = cache.stateParams;
  }
  vm.isCreating = vm.stateParams.creating;

  if (!vm.isCreating) {
    ChoicesListManagement.read(vm.stateParams.id)
      .then(data => {
        vm.choice = data;
      })
      .catch(Notify.handleError);
  }

  // load CHOICES LIST MANAGEMENT
  ChoicesListManagement.read()
    .then(choicesList => {
      vm.choicesList = choicesList;
    })
    .catch(Notify.handleError);

  // submit the data to the server from all two forms (update, create)
  function submit(choicesListManagementForm) {
    vm.hasNoChange = choicesListManagementForm.$submitted && choicesListManagementForm.$pristine && !vm.isCreating;
    if (choicesListManagementForm.$invalid) { return null; }
    if (!choicesListManagementForm.$dirty) { return null; }

    const promise = (vm.isCreating)
      ? ChoicesListManagement.create(vm.choice)
      : ChoicesListManagement.update(vm.choice.id, vm.choice);

    return promise
      .then(() => {
        const translateKey = (vm.isCreating) ? 'FORM.INFO.CREATE_SUCCESS' : 'FORM.INFO.UPDATE_SUCCESS';
        Notify.success(translateKey);
        $state.go('choices_list_management', null, { reload : true });
      })
      .catch(Notify.handleError);
  }

  function onSelectParent(parent) {
    vm.choice.parent = parent.id;
  }

  function onSelectGroup(group) {
    vm.choice.group_label = group.id;
  }

  function clear(value) {
    vm.choice[value] = 0;
  }

  function closeModal() {
    $state.transitionTo('choices_list_management');
  }
}
