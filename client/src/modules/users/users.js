angular.module('bhima.controllers')
  .controller('UsersController', UsersController);

UsersController.$inject = ['$state', 'UserService', 'NotifyService', 'ModalService'];

/**
 * Users Controller
 * This module is responsible for handling the CRUD operation on the user
 */
function UsersController($state, Users, Notify, Modal) {
  var vm = this;

  // options for the UI grid
  vm.gridOptions = {
    appScopeProvider  : vm,
    enableColumnMenus : false,
    fastWatch         : true,
    flatEntityAccess  : true,
    enableSorting     : true,
    columnDefs : [
      { field : 'display_name', name : 'Display Name' },
      { field : 'username', name : 'User Name', cellTemplate: '/modules/users/templates/user.name.cell.html' },
      { name : 'action', displayName : '', cellTemplate: '/modules/users/templates/grid/action.cell.html', enableSorting : false }
    ],
  };

  // the user object that is either edited or created
  vm.user = {};

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

  function activatePermissions(user, value, message){
    vm.user.deactivated = value;
    
    Modal.confirm(message)
      .then(function (confirmResponse) {
        if (!confirmResponse) {
          return false;
        }

        // user has confirmed activation or deactivation of debtor group
        return Users.update(user.id, vm.user)
          .then(function () {
            Notify.success("USERS.UPDATED");
            $state.go('users.list', null, {reload : true});
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
