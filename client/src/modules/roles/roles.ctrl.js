angular.module('bhima.controllers')
  .controller('RolesController', RolesController);

RolesController.$inject = [
  '$uibModal', 'RolesService', 'SessionService', 'ModalService',
  'NotifyService', 'bhConstants',
];

function RolesController($uibModal, Roles, session, Modal, Notify, bhConstants) {
  const vm = this;

  vm.canEditRoles = false;

  vm.add = (role = { project_id : session.project.id }) => {
    $uibModal.open({
      templateUrl : 'modules/roles/create.html',
      controller : 'RolesAddController as RolesAddCtrl',
      resolve : { data : () => role },
    });
  };

  vm.editActions = (role) => {
    $uibModal.open({
      templateUrl : 'modules/roles/modal/roleActions.html',
      controller : 'RoleActionsController as RoleActionsCtrl',
      resolve : { data : () => role },
    });
  };

  // pages to affect to this role
  vm.pages = function pages(role) {
    $uibModal.open({
      templateUrl : 'modules/roles/modal/rolesPermissions.html',
      controller : 'RolesPermissionsController as RolesPermissionsCtrl',
      resolve : { data : () => role },
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
    cellTemplate : 'modules/roles/templates/action.tmpl.html',
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
}
