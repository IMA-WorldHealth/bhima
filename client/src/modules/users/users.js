angular.module('bhima.controllers')
  .controller('UsersController', UsersController);

UsersController.$inject = ['$state', '$uibModal', 'UserService', 'NotifyService', 'ModalService', 'uiGridConstants'];

/**
 * Users Controller
 * This module is responsible for handling the CRUD operation on the user
 */
function UsersController($state, $uibModal, Users, Notify, Modal, uiGridConstants) {
  const vm = this;
  vm.gridApi = {};
  vm.filterEnabled = false;
  vm.toggleFilter = toggleFilter;
  vm.editRoles = editRoles;

  // this function selectively applies the muted cell classes to
  // disabled user entities
  function muteDisabledCells(grid, row) {
    return (row.entity.deactivated) ? `text-muted strike` : '';
  }

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
        field : 'display_name',
        displayName : 'FORM.LABELS.USERNAME',
        headerCellFilter : 'translate',
        cellClass : muteDisabledCells,
        enableFiltering : true,
        sort : { priority : 1, direction : 'asc' },
      },
      {
        field : 'username',
        displayName : 'FORM.LABELS.LOGIN',
        headerCellFilter : 'translate',
        cellClass : muteDisabledCells,
        enableFiltering : true,
      },
      {
        field : 'roles',
        displayName : 'FORM.LABELS.ROLES',
        headerCellFilter : 'translate',
        enableFiltering : true,
        cellClass : muteDisabledCells,
      },
      {
        field : 'depots',
        displayName : 'FORM.LABELS.DEPOT',
        headerCellFilter : 'translate',
        enableFiltering : true,
        cellClass : muteDisabledCells,
      },
      {
        field : 'cashboxes',
        displayName : 'FORM.LABELS.CASHBOXES',
        headerCellFilter : 'translate',
        enableFiltering : true,
        cellClass : muteDisabledCells,
      },
      {
        field : 'action',
        displayName : '',
        cellTemplate : '/modules/users/templates/grid/action.cell.html',
        enableSorting : false,
        enableFiltering : false,
      },
    ],
  };

  function onRegisterApiFn(gridApi) {
    vm.gridApi = gridApi;
  }

  // the user object that is either edited or created
  vm.user = {};

  function toggleFilter() {
    vm.gridOptions.enableFiltering = !vm.gridOptions.enableFiltering;
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
  }

  // bind methods
  vm.edit = edit;
  vm.editPermissions = editPermissions;
  vm.activatePermissions = activatePermissions;

  vm.updateDepots = updateDepots;
  vm.cashBoxManagement = cashBoxManagement;

  function edit(user) {
    $state.go('users.edit', { id : user.id, creating : false });
  }

  function editPermissions(user) {
    $state.go('users.editPermission', { id : user.id });
  }

  function updateDepots(user) {
    $state.go('users.depotManagement', { id : user.id });
  }

  function cashBoxManagement(user) {
    $state.go('users.cashBoxManagement', { id : user.id });
  }

  function activatePermissions(user, value, message) {
    vm.user.deactivated = value;

    Modal.confirm(message)
      .then((confirmResponse) => {
        if (!confirmResponse) {
          return false;
        }

        // user has confirmed activation or deactivation of debtor group
        return Users.update(user.id, vm.user)
          .then(() => {
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
      .then((users) => {
        vm.gridOptions.data = users;
      })
      .catch(handleError)
      .finally(() => {
        toggleLoadingIndicator();
      });
  }

  function editRoles(user) {
    $uibModal.open({
      keyboard : false,
      backdrop : 'static',
      templateUrl : 'modules/roles/modal/userRole.html',
      controller : 'UsersRolesController as UsersRolesCtrl',
      resolve : {
        data : function dataProvider() {
          return user;
        },
      },
    }).result.then(() => {
      loadGrid();
    });

  }
  function toggleLoadingIndicator() {
    vm.loading = !vm.loading;
  }

  loadGrid();
}
