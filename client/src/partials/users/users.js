angular.module('bhima.controllers')
  .controller('UsersController', UsersController);

UsersController.$inject = ['$state', 'UserService', 'NotifyService'];

/**
 * Users Controller
 * This module is responsible for handling the CRUD operation on the user
 */
function UsersController($state, Users, Notify) {
  var vm = this;

  // options for the UI grid
  vm.gridOptions = {
    appScopeProvider  : vm,
    enableColumnMenus : false,
    fastWatch         : true,
    flatEntityAccess  : true,
    enableSorting     : true,
    columnDefs        : [
      { field: 'display_name', name: 'Display Name' },
      { field: 'username', name: 'User Name' },
      { name: 'action', displayName: '', cellTemplate: '/partials/users/templates/grid/action.cell.html', enableSorting: false },
    ],
  };

  // the user object that is either edited or created
  vm.user = {};

  // bind methods
  vm.edit = edit;
  vm.editPermissions = editPermissions;

  function edit(user) {
    $state.go('users.edit', { id: user.id, creating: false });
  }

  function editPermissions(user) {
    $state.go('users.editPermission', { id: user.id });
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
