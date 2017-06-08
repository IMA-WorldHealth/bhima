angular.module('bhima.controllers')
  .controller('UsersController', UsersController);

UsersController.$inject = ['$state', 'UserService', 'NotifyService', 'ModalService', 'uiGridConstants'];

/**
 * Users Controller
 * This module is responsible for handling the CRUD operation on the user
 */
function UsersController($state, Users, Notify, Modal, uiGridConstants) {
  var vm = this;
  vm.gridApi = {};
  vm.filterEnabled = false;
  vm.toggleFilter = toggleFilter;

  // options for the UI grid
  vm.gridOptions = {
    appScopeProvider  : vm,
    enableColumnMenus : false,
    fastWatch         : true,
    flatEntityAccess  : true,
    enableSorting     : true,
    onRegisterApi     : onRegisterApiFn,
    columnDefs : [
      { field : 'display_name', displayName : 'FORM.LABELS.USERNAME', headerCellFilter : 'translate', enableFiltering  : true },
      { field : 'username', displayName : 'FORM.LABELS.LOGIN', headerCellFilter : 'translate', cellTemplate : '/modules/users/templates/user.name.cell.html', enableFiltering  : true },
      { field : 'action', displayName : '', cellTemplate : '/modules/users/templates/grid/action.cell.html', enableSorting : false, enableFiltering  : false },
    ],
  };

  function onRegisterApiFn(gridApi) {
    vm.gridApi = gridApi;
  }

  // the user object that is either edited or created
  vm.user = {};

  function toggleFilter() {
    vm.gridOptions.enableFiltering = vm.filterEnabled = !vm.filterEnabled;
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
  }

  // bind methods
  vm.edit = edit;
  vm.editPermissions = editPermissions;
  vm.activatePermissions = activatePermissions;

  function edit(user) {
    $state.go('users.edit', { id: user.id, creating: false });
  }

  function editPermissions(user) {
    $state.go('users.editPermission', { id: user.id });
  }

  function activatePermissions(user, value, message) {
    vm.user.deactivated = value;

    Modal.confirm(message)
      .then(function (confirmResponse) {
        if (!confirmResponse) {
          return false;
        }

        // user has confirmed activation or deactivation of debtor group
        return Users.update(user.id, vm.user)
          .then(function () {
            Notify.success('USERS.UPDATED');
            $state.go('users.list', null, { reload : true });
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
    toggleLoadingIndicator();
    vm.hasError = false;

    Users.read()
      .then(function (users) {
        vm.gridOptions.data = users;
      })
      .catch(handleError)
      .finally(function () {
        toggleLoadingIndicator();
      });
  }

  function toggleLoadingIndicator() {
    vm.loading = !vm.loading;
  }

  loadGrid();
}
