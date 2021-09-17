angular.module('bhima.controllers')
  .controller('CostCenterAllocationRegistryController', CostCenterAllocationRegistryController);

CostCenterAllocationRegistryController.$inject = [
  'CostCenterService',
  'ModalService',
  'NotifyService',
];

function CostCenterAllocationRegistryController(
  CostCenters,
  ModalService,
  Notify,
) {
  const vm = this;

  // global variables
  vm.gridApi = {};
  vm.filterEnabled = false;

  // options for the UI grid
  vm.gridOptions = {
    appScopeProvider  : vm,
    enableColumnMenus : false,
    fastWatch         : true,
    flatEntityAccess  : true,
    enableSorting     : false,
    onRegisterApi     : onRegisterApiFn,
  };

  function onRegisterApiFn(gridApi) {
    vm.gridApi = gridApi;
  }

  function load() {
    CostCenters.getAllocationRegistry({ test : 'hello world' })
      .then(rows => {
        // data presentation logic here
        return rows;
      })
      .catch(Notify.handleError);
  }

  load();
}
