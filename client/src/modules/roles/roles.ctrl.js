angular.module('bhima.controllers')
  .controller('RolesController', RolesController);

RolesController.$inject = [
  '$uibModal', 'RolesService', 'SessionService', 'ModalService',
  'NotifyService', 'bhConstants', 'uiGridConstants'
];

function RolesController($uibModal, Roles, Session, Modal, Notify, bhConstants, uiGridConstants) {
  const vm = this;

  vm.canEditRoles = false;

  vm.createUpdateRoleModal = function createUpdateRoleModal(selectedRole) {
    // if no selected role was passed this means we are creating a new role
    // set the default role parameters to pass the modal (set project ID)
    const role = selectedRole || { project_id : Session.project.id };
    $uibModal.open({
      templateUrl : 'modules/roles/create.html',
      controller : 'RolesAddController as RolesAddCtrl',
      resolve : { data : () => role },
    });
  };

  vm.updateRoleActionsModal = function updateRoleActionsModal(selectedRole) {
    $uibModal.open({
      templateUrl : 'modules/roles/modal/roleActions.html',
      controller : 'RoleActionsController as RoleActionsCtrl',
      resolve : { data : () => selectedRole },
    });
  };

  // pages to affect to this role
  vm.updateRolePermissionsModal = function updateRolePermissionsModal(selectedRole) {
    $uibModal.open({
      templateUrl : 'modules/roles/modal/rolesPermissions.html',
      controller : 'RolesPermissionsController as RolesPermissionsCtrl',
      resolve : { data : () => selectedRole },
    }).result
      .then(() => {
        // refresh the application session to ensure the latest versions of roles
        // and permissions are applied, this will only run on submission
        // @TODO(sfount) if the session information kept track of the current users
        //               role, this method could only update if the current role is changed
        Session.reload();
      });
  };

  vm.remove = function remove(uuid) {
    const message = 'FORM.DIALOGS.DELETE_ROLE';
    Modal.confirm(message)
      .then(confirmResponse => {
        if (!confirmResponse) {
          return;
        }

        Roles.delete(uuid)
          .then(() => {
            Notify.success('FORM.INFO.DELETE_SUCCESS');
            loadRoles();
          })
          .catch(Notify.handleError);
      });
  };

  function checkRoleEditonAllowability() {
    Roles.userHasAction(bhConstants.actions.CAN_EDIT_ROLES)
      .then(response => {
        vm.canEditRoles = response.data;
      })
      .catch(Notify.handleError);
  }

  function loadRoles() {
    vm.loading = true;

    checkRoleEditonAllowability();

    Roles.read()
      .then(roles => {
        vm.gridOptions.data = roles;
      })
      .catch(Notify.handleError)
      .finally(() => {
        vm.loading = false;
      });
  }

  const columns = [{
    field : 'label',
    displayName : 'FORM.LABELS.NAME',
    headerCellFilter : 'translate',
  }, {
    field : 'actions',
    width : 100,
    displayName : '',
    headerCellFilter : 'translate',
    cellTemplate : 'modules/roles/templates/action.cell.html',
  }];

  // ng-click="
  vm.gridOptions = {
    appScopeProvider : vm,
    enableColumnMenus : false,
    columnDefs : columns,
    enableSorting : true,
    data : [],
    fastWatch : true,
    flatEntityAccess : true,
    onRegisterApi : (gridApi) => {
      vm.gridApi = gridApi;
    },
  };

  loadRoles();
  /**
   * @function toggleInlineFilter
   *
   * @description
   * Switches the inline filter on and off.
   */
   vm.toggleInlineFilter = function toggleInlineFilter() {
    vm.gridOptions.enableFiltering = !vm.gridOptions.enableFiltering;
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
  };
}
