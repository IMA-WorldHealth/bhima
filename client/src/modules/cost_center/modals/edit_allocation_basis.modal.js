angular.module('bhima.controllers')
  .controller('AllocationBasisEditController', AllocationBasisEditController);

AllocationBasisEditController.$inject = [
  'CostCenterService', 'AllocationBasisService', 'ModalService', 'NotifyService',
  '$uibModalInstance', 'uiGridConstants', '$translate',
];

function AllocationBasisEditController(CostCenter, AllocationBasisService, Modal, Notify, Instance,
  uiGridConstants, $translate) {
  const vm = this;

  vm.loading = false;
  vm.close = Instance.close;
  vm.createAllocationBasis = createAllocationBasis;
  vm.editAllocationBasis = editAllocationBasis;
  vm.deleteAllocationBasis = deleteAllocationBasis;

  function editAllocationBasis(id) {
    CostCenter.createUpdateAllocationBasis({ id })
      .result
      .then(() => {
        loadAllocationBases();
      });
  }

  function createAllocationBasis() {
    CostCenter.createUpdateAllocationBasis({})
      .result
      .then(() => {
        loadAllocationBases();
      });
  }

  function deleteAllocationBasis(id) {
    Modal.confirm('FORM.DIALOGS.CONFIRM_DELETE')
      .then((bool) => {
        if (!bool) { return; }

        AllocationBasisService.delete(id)
          .then(() => {
            loadAllocationBases();
          })
          .catch(Notify.handleError);
      });
  }

  function loadAllocationBases() {
    vm.loading = true;
    AllocationBasisService.getAllocationBases()
      .then((bases) => {
        // Translate the basis terms for predefined terms
        bases.forEach(base => {
          if (base.is_predefined) {
            base.name = $translate.instant(`FORM.LABELS.${base.name}`);
            base.description = $translate.instant(`FORM.LABELS.${base.description}`);
          }
        });
        vm.gridOptions.data = bases;
      })
      .catch(Notify.handleError)
      .finally(() => {
        vm.loading = false;
      });
  }

  const columns = [{
    field : 'name',
    displayName : 'TABLE.COLUMNS.NAME',
    headerCellFilter : 'translate',
    cellFilter : 'translate',
    width : '25%',
  }, {
    field : 'description',
    displayName : 'TABLE.COLUMNS.DESCRIPTION',
    headerCellFilter : 'translate',
    cellTemplate : '/modules/cost_center/templates/description.cell.html',
  }, {
    field : 'units',
    displayName : 'TABLE.COLUMNS.UNIT',
    headerCellFilter : 'translate',
    headerCellClass : 'text-center',
    headerTooltip : 'TABLE.COLUMNS.UNIT',
    cellClass : 'text-center',
    width : 100,
  }, {
    field : 'is_predefined',
    displayName : 'TABLE.COLUMNS.PREDEFINED',
    headerCellFilter : 'translate',
    headerCellClass : 'text-center',
    headerTooltip : 'TABLE.COLUMNS.PREDEFINED',
    cellTemplate : '/modules/cost_center/templates/predefined.cell.html',
    width : 110,
  }, {
    field : 'actions',
    enableFiltering : false,
    width : 80,
    displayName : '',
    headerCellFilter : 'translate',
    cellTemplate : '/modules/cost_center/templates/action_edit_allocation_basis.tmpl.html',
  }];

  // ng-click="
  vm.gridOptions = {
    appScopeProvider : vm,
    enableColumnMenus : false,
    columnDefs : columns,
    enableSorting : true,
    flatEntityAccess  : true,
    data : [],
    fastWatch : true,
    onRegisterApi : (gridApi) => {
      vm.gridApi = gridApi;
    },
  };

  loadAllocationBases();

}
