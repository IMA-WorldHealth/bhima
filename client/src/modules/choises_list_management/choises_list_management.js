angular.module('bhima.controllers')
  .controller('ChoisesListManagementController', ChoisesListManagementController);

ChoisesListManagementController.$inject = [
  '$state', 'ChoisesListManagementService', 'NotifyService', 'uiGridConstants', 'ModalService',
];

/**
 * CHOISES LIST MANAGEMENT Controller
 * This module is responsible for handling the CRUD operation on CHOISES LIST MANAGEMENT
 */

function ChoisesListManagementController($state, ChoisesListManagement, Notify, uiGridConstants, ModalService) {
  const vm = this;
  vm.gridApi = {};
  vm.filterEnabled = false;
  vm.toggleFilter = toggleFilter;

  // options for the UI grid
  vm.gridOptions = {
    appScopeProvider  : vm,
    enableColumnMenus : false,
    fastWatch         : true,
    flatEntityAccess  : true,
    showTreeExpandNoChildren : false,
    enableSorting     : true,
    onRegisterApi     : onRegisterApiFn,
    columnDefs : [
      {
        field : 'name',
        displayName : 'FORM.LABELS.VARIABLE_NAME',
        enableFiltering : 'true',
        headerCellFilter : 'translate',
        cellTemplate : '/modules/choises_list_management/templates/gridName.tmpl.html',
      },
      {
        field : 'label',
        displayName : 'FORM.LABELS.DESIGNATION',
        enableFiltering : 'true',
        headerCellFilter : 'translate',
        cellTemplate : '/modules/choises_list_management/templates/gridLabels.tmpl.html',
      },
      {
        field : 'is_title',
        displayName : 'FORM.LABELS.TITLE',
        enableFiltering : 'true',
        headerCellFilter : 'translate',
        cellTemplate : '/modules/choises_list_management/templates/is_title.tmpl.html',
      },
      {
        field : 'action',
        displayName : '',
        enableFiltering : 'false',
        cellTemplate : '/modules/choises_list_management/templates/action.cell.tmpl.html',
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

  // bind methods
  vm.edit = edit;
  vm.remove = remove;

  function edit(choisesListManagement) {
    $state.go('choises_list_management.edit', { id : choisesListManagement.id });
  }

  function remove(id) {
    ModalService.confirm('FORM.DIALOGS.CONFIRM_DELETE')
      .then(() => {
        ChoisesListManagement.delete(id)
          .then(() => {
            Notify.success('FORM.INFO.DELETE_SUCCESS');
            loadGrid();
          })
          .catch(Notify.handleError);
      });
  }
  function handleError(error) {
    vm.hasError = true;
    Notify.handleError(error);
  }

  // load user grid
  function loadGrid() {
    vm.hasError = false;
    vm.loading = true;

    ChoisesListManagement.read()
      .then((data) => {
        const dataTree = ChoisesListManagement.formatStore(data);
        vm.gridOptions.data = dataTree;
      })
      .catch(handleError)
      .finally(toggleLoadingIndicator);
  }

  function toggleLoadingIndicator() {
    vm.loading = false;
  }

  loadGrid();
}
