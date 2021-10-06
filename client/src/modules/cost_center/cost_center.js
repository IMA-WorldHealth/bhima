angular.module('bhima.controllers')
  .controller('CostCenterController', CostCenterController);

CostCenterController.$inject = [
  'CostCenterService', 'ModalService', 'NotifyService', 'uiGridConstants',
  '$uibModal', '$translate', 'GridStateService', '$state',
];

/**
 * Cost Center Controller
 *
 * This controller is about the Cost Center module in the admin zone
 * It's responsible for creating, editing and updating a Cost Center
 */
function CostCenterController(CostCenters, ModalService, Notify, uiGridConstants,
  $uibModal, $translate, GridState, $state) {
  const vm = this;

  const cacheKey = 'CostCenterRegistry';

  // bind methods
  vm.deleteCostCenter = deleteCostCenter;
  vm.toggleFilter = toggleFilter;
  vm.openEditAllocationBasisModal = openEditAllocationBasisModal;
  vm.editAllocationStepOrder = editAllocationStepOrder;

  // global variables
  vm.gridApi = {};
  vm.filterEnabled = false;

  // options for the UI grid
  vm.gridOptions = {
    appScopeProvider  : vm,
    enableColumnMenus : false,
    fastWatch         : true,
    flatEntityAccess  : true,
    enableSorting     : true,
    onRegisterApi     : onRegisterApiFn,
    columnDefs : [
      {
        field : 'label',
        displayName : 'FORM.LABELS.DESIGNATION',
        headerCellFilter : 'translate',
      },
      {
        field : 'abbrs',
        displayName : 'FORM.LABELS.REFERENCE',
        headerCellFilter : 'translate',
        visible : true,
      },
      {
        field : 'projectName',
        displayName : 'FORM.LABELS.PROJECT',
        headerCellFilter : 'translate',
        visible : true,
      },
      {
        field : 'serviceNames',
        displayName : 'FORM.LABELS.SERVICES',
        headerCellFilter : 'translate',
        visible : true,
      },
      {
        field : 'is_principal',
        displayName : '',
        headerCellFilter : 'translate',
        enableFiltering : false,
        enableSorting : true,
        cellTemplate : '/modules/cost_center/templates/costCenterType.tmpl.html',
      },
      {
        field : 'allocation_method',
        displayName : 'ALLOCATION_METHOD',
        headerToolTip : 'ALLOCATION_METHOD_TOOLTIP',
        headerCellFilter : 'translate',
        headerCellClass : 'allocationBasisColHeader',
        visible : true,
        cellTemplate : '/modules/cost_center/templates/allocationBasis.tmpl.html',
      },
      {
        field : 'allocation_basis_name',
        displayName : 'ALLOCATION_BASIS',
        headerCellFilter : 'translate',
        headerCellClass : 'allocationBasisColHeader',
        visible : true,
      },
      {
        field : 'action',
        width : 80,
        displayName : '',
        cellTemplate : '/modules/cost_center/templates/action.tmpl.html',
        enableSorting : false,
        enableFiltering : false,
      },
    ],
  };

  function onRegisterApiFn(gridApi) {
    vm.gridApi = gridApi;
  }

  function toggleFilter() {
    vm.filterEnabled = !vm.filterEnabled;
    vm.gridOptions.enableFiltering = vm.filterEnabled;
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
  }

  function loadCostCenters() {
    vm.loading = true;
    CostCenters.read()
      .then((data) => {
        data.forEach(fc => {
          // Translate each cost center allocation basis name
          if (fc.allocation_basis.is_predefined) {
            fc.allocation_basis_name = $translate.instant(fc.allocation_basis.name);
            fc.allocation_basis_units = fc.allocation_basis.units ? $translate.instant(fc.allocation_basis.units) : '';
          } else {
            fc.allocation_basis_name = fc.allocation_basis.name;
            fc.allocation_basis_units = fc.allocation_basis.units;
          }
          if (fc.allocation_basis_units) {
            fc.allocation_basis_name += ` (${fc.allocation_basis_units})`;
          }
        });
        vm.gridOptions.data = data;
      })
      .catch(Notify.handleError)
      .finally(() => {
        vm.loading = false;
      });
  }

  // switch to delete warning mode
  function deleteCostCenter(costCenter) {
    ModalService.confirm('FORM.DIALOGS.CONFIRM_DELETE')
      .then((bool) => {
        if (!bool) { return; }

        CostCenters.delete(costCenter.id)
          .then(() => {
            Notify.success('FORM.INFO.DELETE_SUCCESS');
            loadCostCenters();
          })
          .catch(Notify.handleError);
      });
  }

  const state = new GridState(vm.gridOptions, cacheKey);
  vm.saveGridState = state.saveGridState;
  vm.clearGridState = function clearGridState() {
    state.clearGridState();
    $state.reload();
  };

  function openEditAllocationBasisModal() {
    $uibModal.open({
      templateUrl : 'modules/cost_center/modals/edit_allocation_basis.modal.html',
      controller : 'AllocationBasisEditController as ModalCtrl',
      size : 'lg',
    }).result.catch(angular.noop);
  }

  function editAllocationStepOrder() {
    $uibModal.open({
      templateUrl : 'modules/cost_center/modals/edit_allocation_step_order.modal.html',
      controller : 'AllocationEditStepOrderController as ModalCtrl',
      // size : 'lg',
    }).result.catch(angular.noop);
  }

  loadCostCenters();
}
