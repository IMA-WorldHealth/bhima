angular.module('bhima.controllers')
  .controller('ChoisesListManagementModalController', ChoisesListManagementModalController);

ChoisesListManagementModalController.$inject = [
  '$state', 'ChoisesListManagementService', 'NotifyService', 'appcache',
];

/**
 * CHOISES LIST MANAGEMENT Modal Controller
 */

function ChoisesListManagementModalController($state, ChoisesListManagement, Notify, AppCache) {
  const vm = this;
  const cache = AppCache('ChoisesListManagementModal');

  vm.choise = {};
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
    vm.choise.parent = $state.params.parentId;
  } else {
    vm.stateParams = cache.stateParams;
  }
  vm.isCreating = vm.stateParams.creating;

  if (!vm.isCreating) {
    ChoisesListManagement.read(vm.stateParams.id)
      .then(data => {
        vm.choise = data;
      })
      .catch(Notify.handleError);
  }

  // load CHOISES LIST MANAGEMENT
  ChoisesListManagement.read()
    .then(choisesList => {
      vm.choisesList = choisesList;
    })
    .catch(Notify.handleError);

  // submit the data to the server from all two forms (update, create)
  function submit(choisesListManagementForm) {
    vm.hasNoChange = choisesListManagementForm.$submitted && choisesListManagementForm.$pristine && !vm.isCreating;
    if (choisesListManagementForm.$invalid) { return null; }
    if (!choisesListManagementForm.$dirty) { return null; }

    const promise = (vm.isCreating)
      ? ChoisesListManagement.create(vm.choise)
      : ChoisesListManagement.update(vm.choise.id, vm.choise);

    return promise
      .then(() => {
        const translateKey = (vm.isCreating) ? 'FORM.INFO.CREATE_SUCCESS' : 'FORM.INFO.UPDATE_SUCCESS';
        Notify.success(translateKey);
        $state.go('choises_list_management', null, { reload : true });
      })
      .catch(Notify.handleError);
  }

  function onSelectParent(parent) {
    vm.choise.parent = parent.id;
  }

  function onSelectGroup(group) {
    vm.choise.group_label = group.id;
  }

  function clear(value) {
    vm.choise[value] = 0;
  }

  function closeModal() {
    $state.transitionTo('choises_list_management');
  }
}
