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
    appScopeProvider : vm,
    enableColumnMenus : false,
    columnDefs : [
      { field : 'display_name', name : 'Display Name' },
      { field : 'username', name : 'User Name' },
      { name : 'action', displayName : '', cellTemplate: '/modules/users/templates/grid/action.cell.html', enableSorting : false }
    ],
    enableSorting : true
  };

  // the user object that is either edited or created
  vm.user = {};

  // bind methods
  vm.edit = edit;
  vm.editPermissions = editPermissions;

  function edit(user) {
    $state.go('users.edit', {id : user.id, creating : false}, {reload : false});
  }

  function editPermissions(user) {
    $state.go('users.editPermission', {id : user.id}, {reload : false});
  }

  // load user grid
  function loadGrid() {
    Users.read().then(function (users) {
      vm.gridOptions.data = users;
    })
    .catch(Notify.handleError);
  }

  loadGrid();
}
