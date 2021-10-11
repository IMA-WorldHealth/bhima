angular.module('bhima.controllers')
  .controller('CostCenterAllocationBasesController', CostCenterAllocationBasesController);

CostCenterAllocationBasesController.$inject = [
  '$state',
  'CostCenterService',
  'AllocationBasisQuantityService',
  'uiGridConstants',
  'NotifyService',
  '$uibModal',
];

function CostCenterAllocationBasesController(
  $state,
  CostCenters,
  AllocationBasisQuantity,
  uiGridConstants,
  Notify,
  $modal,
) {
  const vm = this;

  // global variables
  vm.gridApi = {};
  vm.editAllocationBasis = editAllocationBasis;
  vm.removeAllocationBasis = removeAllocationBasis;
  vm.updateComputableQuantities = updateComputableQuantities;
  vm.showAllocationBasesTable = showAllocationBasesTable;

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

  function updateComputableQuantities() {
    vm.loading = true;
    AllocationBasisQuantity.updateQuantities()
      .then(() => {
        Notify.success('FORM.INFO.SUCCESS');
        $state.go('cost_center_allocation_bases', null, { reload : true });
      })
      .finally(() => {
        vm.loading = false;
      });
  }

  function showAllocationBasesTable() {
    $modal.open({
      templateUrl : 'modules/cost_center/modals/edit_allocation_basis.modal.html',
      controller : 'AllocationBasisEditController as ModalCtrl',
      size : 'lg',
    }).result.catch(angular.noop);
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
          enableSorting : true,
          sort: { direction: uiGridConstants.ASC, priority: 0 },
        }];

        // Build other columns for ui-grid
        const otherColumns = rows.costCenterIndexes.map((item) => {
          return {
            field : item.index,
            displayName : item.index,
            type : 'number',
            headerCellFilter : 'translate',
            cellClass : 'text-right',
            footerCellClass : 'text-right',
            cellFilter : 'number: 2',
            footerCellFilter : 'number:2',
            enableSorting : true,
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
        const data = rows.costCenterList.map(label => ({ label }));

        // populate the data matrix with the cost center indexes
        rows.costCenterIndexes.forEach(base => {
          base.distribution.forEach(item => {
            const row = data.find(cc => cc.label === item.cost_center_label);
            row[base.index] = item.value;
            row.id = item.id;
          });
        });

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
