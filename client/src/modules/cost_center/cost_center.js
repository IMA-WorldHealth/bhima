angular.module('bhima.controllers')
  .controller('costCenterController', costCenterController);

costCenterController.$inject = [
  'CostCenterService', 'ModalService', 'NotifyService', 'uiGridConstants',
];

/**
 * Cost Center Controller
 *
 * This controller is about the Cost Center module in the admin zone
 * It's responsible for creating, editing and updating a Cost Center
 */
function costCenterController(CostCenters, ModalService, Notify, uiGridConstants) {
  const vm = this;

  // bind methods
  vm.deleteCostCenter = deleteCostCenter;
  vm.toggleFilter = toggleFilter;

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
      { field : 'label', displayName : 'FORM.LABELS.DESIGNATION', headerCellFilter : 'translate' },
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

  loadCostCenters();
}
