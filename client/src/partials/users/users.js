angular.module('bhima.controllers')
.controller('UsersController', UsersController);

UsersController.$inject = [
  '$window', '$translate', '$http', '$uibModal', 'util', 'SessionService', 'UserService',
  'ProjectService', 'NodeTreeService', '$state'
];

/**
 * Users Controller
 *
 * This module is responsible for handling the creation
 * of users 
 * 
 */
function UsersController($window, $translate, $http, $uibModal, util, Session, Users, Projects, NT, $state) {
  var vm = this;

  // options for the UI grid
  vm.gridOptions = {
    appScopeProvider : vm,
    enableColumnMenus : false,
    columnDefs : [
      { field : 'display_name', name : 'Display Name' },
      { field : 'username', name : 'User Name' },
      { name : 'edit', displayName : '', cellTemplate: '/partials/users/templates/grid/edit.cell.html', enableSorting : false },
      { name : 'permission', displayName : '', cellTemplate: '/partials/users/templates/grid/permissions.cell.html', enableSorting : false }
    ],
    enableSorting : true
  };

  // the user object that is either edited or created
  vm.user = {};

  // bind methods
  vm.addUser = addUser;
  vm.edit = edit;
  vm.editPermissions = editPermissions;

  vm.maxLength = util.maxTextLength;
  vm.userName = 80;
  vm.length100 = util.length100;

  function addUser(){
    $state.go('users.create');
  }

  function edit(user) {
    $state.go('users.edit', {id : user.id, creating : false}, {reload : false});
  }

  function editPermissions(user) {
    $state.go('users.editPermission', {id : user.id}, {reload : false});
  }

  function handler(error) {
    throw error;
  }

  // load user grid
  function loadGrid() {
    Users.read().then(function (users) {
      vm.gridOptions.data = users;
    });
  }

  loadGrid();  
}
