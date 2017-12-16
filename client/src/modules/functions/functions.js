angular.module('bhima.controllers')
.controller('FunctionManagementController', FunctionManagementController);

FunctionManagementController.$inject = [
  'FunctionService', 'ModalService',
  'NotifyService', 'uiGridConstants', '$state', 'SessionService',
];

/**
 * Function Management Controller
 *
 * This controller is about the Job Title management module in the admin zone
 * It's responsible for creating, editing and updating a Job Title
 */
function FunctionManagementController(Functions, ModalService,
  Notify, uiGridConstants, $state, Session) {
  var vm = this;

  // bind methods
  vm.deleteFunction = deleteFunction;
  vm.editFunction = editFunction;
  vm.createFunction = createFunction;
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
      { field : 'fonction_txt', displayName : 'FORM.LABELS.DESIGNATION', headerCellFilter : 'translate' },
      { field : 'action',
        width : 80,
        displayName : '',
        cellTemplate : '/modules/functions/templates/action.tmpl.html',
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

  function loadFunctions() {
    vm.loading = true;

    Functions.read(null, { detailed : 1 })
    .then(function (data) {
      vm.gridOptions.data = data;
    })
    .catch(Notify.handleError)
    .finally(function () {
      vm.loading = false;
    });
  }

  // switch to delete warning mode
  function deleteFunction(profession) {
    ModalService.confirm('FORM.DIALOGS.CONFIRM_DELETE')
    .then(function (bool) {
      if (!bool) { return; }

      Functions.delete(profession.id)
      .then(function () {
        Notify.success('PROFESSION.DELETED');
        loadFunctions();
      })
      .catch(Notify.handleError);
    });
  }

  // update an existing Profession
  function editFunction(profession) {
    $state.go('functions.edit', { id : profession.id });
  }

  // create a new Function
  function createFunction() {
    $state.go('functions.create');
  }

  loadFunctions();
}
