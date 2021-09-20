angular.module('bhima.controllers')
  .controller('CostCenterAllocationBasesController', CostCenterAllocationBasesController);

CostCenterAllocationBasesController.$inject = [
  'CostCenterService',
  'uiGridConstants',
  'NotifyService',
];

function CostCenterAllocationBasesController(
  CostCenters,
  uiGridConstants,
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
    showColumnFooter  : true,
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
          field : 'label',
          displayName : 'COST_CENTER.TITLE',
          headerCellFilter : 'translate',
          cellFilter : 'translate',
          aggregationHideLabel : true,
          aggregationType : uiGridConstants.aggregationTypes.count,
        }];

        rows.costCenterIndexes.forEach((item, idx) => {
          if (idx >= 0) {
            const column = {
              field : `idx${idx}`,
              displayName : item.index,
              type : 'number',
              headerCellFilter : 'translate',
              cellClass : 'text-right',
              footerCellClass : 'text-right',
              cellFilter : 'number: 2',
              footerCellFilter : 'number:2',
              aggregationHideLabel : true,
              aggregationType : uiGridConstants.aggregationTypes.sum,
            };
            columnDefs.push(column);
          }
        });

        const line = [];
        for (let i = 0; i < rows.costCenterIndexes.length; i++) {
          const base = rows.costCenterIndexes[i];
          line[i] = [];
          for (let j = 0; j < base.distribution.length; j++) {
            const el = base.distribution[j];
            const value = { label : el.cost_center_label };
            value[`idx${i}`] = el.value;
            line[i].push(value);
          }
        }

        const data = [];
        for (let i = 0; i < rows.costCenterList.length; i++) {
          let value = {};
          for (let j = 0; j < line.length; j++) {
            const element2 = line[j];
            value = { ...value, ...element2[i] };
          }
          data.push(value);
        }

        const actionColumn = {
          field : 'action',
          width : 80,
          displayName : '',
          cellTemplate : '/modules/cost_center/allocation_bases/templates/action.tmpl.html',
          enableSorting : false,
          enableFiltering : false,
        };

        vm.gridOptions.columnDefs = columnDefs.concat(actionColumn);
        vm.gridOptions.data = data;
        vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.OPTIONS);
      })
      .catch(Notify.handleError);
  }

  load();
}
