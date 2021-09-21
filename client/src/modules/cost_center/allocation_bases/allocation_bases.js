angular.module('bhima.controllers')
  .controller('CostCenterAllocationBasesController', CostCenterAllocationBasesController);

CostCenterAllocationBasesController.$inject = [
  '$state',
  'CostCenterService',
  'AllocationBasisQuantityService',
  'uiGridConstants',
  'NotifyService',
];

function CostCenterAllocationBasesController(
  $state,
  CostCenters,
  AllocationBasisQuantity,
  uiGridConstants,
  Notify,
) {
  const vm = this;

  // global variables
  vm.gridApi = {};
  vm.editAllocationBasis = editAllocationBasis;
  vm.removeAllocationBasis = removeAllocationBasis;

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

  function editAllocationBasis(id) {
    $state.go('cost_center_allocation_bases.edit', { id });
  }

  function removeAllocationBasis(id) {
    AllocationBasisQuantity.bulkDelete(id)
      .then(() => {
        Notify.success('FORM.INFO.DELETE_SUCCESS');
        $state.go('cost_center_allocation_bases', null, { reload : true });
      });
  }

  function load() {
    vm.loading = true;

    CostCenters.getAllocationKeys()
      .then(rows => {
        if (!rows || (rows && !rows.costCenterIndexes.length)) { return; }

        // First column definition for ui-grid
        const firstColumn = [{
          field : 'label',
          displayName : 'COST_CENTER.TITLE',
          headerCellFilter : 'translate',
          cellFilter : 'translate',
          aggregationHideLabel : true,
          aggregationType : uiGridConstants.aggregationTypes.count,
        }];

        // Build other columns for ui-grid
        const otherColumns = rows.costCenterIndexes.map((item, idx) => {
          return {
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
        });

        // ui-grid columns definition
        const columnDefs = firstColumn.concat(otherColumns);

        /**
         * Transforming data from rows of allocation basis into rows of cost centers.
         * This transformation require two steps:
         *    1. Get all cost centers by allocation basis -> return an array of arrays
         *    2. Format this array of array into an array of objects which fit to ui-grid data format
         */
        const line = [];
        const data = [];

        // First step: Get all cost centers by allocation basis -> return an array of arrays
        for (let i = 0; i < rows.costCenterIndexes.length; i++) {
          const base = rows.costCenterIndexes[i];
          line[i] = [];
          for (let j = 0; j < base.distribution.length; j++) {
            const item = base.distribution[j];
            const value = { id : item.id, label : item.cost_center_label };
            value[`idx${i}`] = item.value;
            line[i].push(value);
          }
        }

        // Second step: Format this array of arrays into an array of objects which fit to ui-grid data format
        for (let i = 0; i < rows.costCenterList.length; i++) {
          let value = {};
          for (let j = 0; j < line.length; j++) {
            /**
             * Pick each i element from each array (line[j])
             * to build an object based on only i th element of each array
             */
            const item = line[j];
            value = { ...value, ...item[i] };
          }
          // Combine all these object for having an array (which fit to ui-grid data format)
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
      .catch(Notify.handleError)
      .finally(() => {
        vm.loading = false;
      });
  }

  load();
}
