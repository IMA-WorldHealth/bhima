angular.module('bhima.controllers')
  .controller('DataCollectorManagementModalController', DataCollectorManagementModalController);

DataCollectorManagementModalController.$inject = [
  '$state', 'DataCollectorManagementService', 'NotifyService', 'appcache', 'ColorService',
];

/**
 * Data Collector Management Modal Controller
 */

function DataCollectorManagementModalController($state, DataCollectorManagement, Notify, AppCache, Color) {
  const vm = this;
  const cache = AppCache('DataCollectorManagementModal');

  vm.dataCollector = {};
  vm.stateParams = {};
  vm.colors = Color.list;

  // exposed methods
  vm.submit = submit;
  vm.closeModal = closeModal;
  vm.clear = clear;

  if ($state.params.creating || $state.params.id) {
    cache.stateParams = $state.params;
    vm.stateParams = cache.stateParams;
  } else {
    vm.stateParams = cache.stateParams;
  }
  vm.isCreating = vm.stateParams.creating;

  if (!vm.isCreating) {
    DataCollectorManagement.read(vm.stateParams.id)
      .then(data => {
        vm.dataCollector = data;
      })
      .catch(Notify.handleError);
  }

  // load Data Collector Management
  DataCollectorManagement.read()
    .then(dataCollectors => {
      vm.dataCollectors = dataCollectors;
    })
    .catch(Notify.handleError);

  // submit the data to the server from all two forms (update, create)
  function submit(dataCollectorManagementForm) {
    vm.hasNoChange = dataCollectorManagementForm.$submitted && dataCollectorManagementForm.$pristine && !vm.isCreating;
    if (dataCollectorManagementForm.$invalid) { return null; }
    if (dataCollectorManagementForm.$pristine) { return null; }

    const promise = (vm.isCreating)
      ? DataCollectorManagement.create(vm.dataCollector)
      : DataCollectorManagement.update(vm.dataCollector.id, vm.dataCollector);

    return promise
      .then(() => {
        const translateKey = (vm.isCreating) ? 'FORM.INFO.CREATE_SUCCESS' : 'FORM.INFO.UPDATE_SUCCESS';
        Notify.success(translateKey);
        $state.go('data_collector_management', null, { reload : true });
      })
      .catch(Notify.handleError);
  }

  function clear(value) {
    vm.dataCollectors[value] = null;
  }

  function closeModal() {
    $state.go('data_collector_management');
  }
}
