angular.module('bhima.controllers')
  .controller('CostCenterAllocationKeysController', CostCenterAllocationKeysController);

CostCenterAllocationKeysController.$inject = [
  'CostCenterService',
  'ModalService',
  'NotifyService',
];

function CostCenterAllocationKeysController(
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
    CostCenters.getAllocationKeys()
      .then(rows => {
        if (!rows || (rows && !rows.costCenterIndexes.length)) { return; }

        const columnDefs = [{
          field : 'index',
          displayName : 'COST_CENTER.TITLE',
          headerCellFilter : 'translate',
          cellFilter : 'translate',
        }];

        rows.costCenterList.forEach((item, idx) => {
          if (idx >= 0) {
            const column = {
              field : `idx${idx}`,
              displayName : item,
              headerCellFilter : 'translate',
            };
            columnDefs.push(column);
          }
        });

        const data = rows.costCenterIndexes.map(item => {
          const value = { index : item.index };
          item.distribution.forEach((el, i) => {
            value[`idx${i}`] = el.value;
          });
          return value;
        });

        vm.gridOptions.columnDefs = columnDefs;
        vm.gridOptions.data = data;
      })
      .catch(Notify.handleError);
  }

  load();
}
