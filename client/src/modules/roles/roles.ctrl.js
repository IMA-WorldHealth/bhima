angular.module('bhima.controllers')
  .controller('RolesController', RolesController);

RolesController.$inject = [
  '$uibModal', 'RolesService', 'SessionService',
  'ModalService', 'NotifyService', 'bhConstants',
];

function RolesController($uibModal, RolesService, session, Modal, Notify, bhConstants) {
  const vm = this;
  vm.loadRoles = loadRoles;
  vm.loading = false;
  vm.canEditRoles = false;

  vm.add = function add(role) {
    const _role = role || {
      project_id : session.project.id,
    };

    $uibModal.open({
      keyboard : false,
      backdrop : 'static',
      templateUrl : 'modules/roles/create.html',
      controller : 'RolesAddController as RolesAddCtrl',
      resolve : {
        data : function dataProvider() {
          return _role;
        },
      },
    });
  };

  vm.editActions = function editActions(role) {
    $uibModal.open({
      keyboard : false,
      backdrop : 'static',
      templateUrl : 'modules/roles/modal/roleActions.html',
      controller : 'RoleActionsController as RoleActionsCtrl',
      resolve : {
        data : () => role,
      },
    });
  };

  // pages to affect to this role
  vm.pages = function pages(role) {
    $uibModal.open({
      keyboard : false,
      backdrop : 'static',
      templateUrl : 'modules/roles/modal/rolesPermissions.html',
      controller : 'RolesPermissionsController as RolesPermissionsCtrl',
      resolve : {
        data : function dataProvider() {
          return role;
        },
      },
    });
  };

  vm.remove = function remove(uuid) {
    const message = 'FORM.DIALOGS.DELETE_ROLE';
    Modal.confirm(message)
      .then(confirmResponse => {
        if (!confirmResponse) {
          return;
        }
        RolesService.delete(uuid).then(() => {
          Notify.success('FORM.INFO.DELETE_SUCCESS');
          vm.loadRoles();
        })
          .catch(Notify.handleError);
      });
  };

  function checkRoleEditonAllowability() {
    RolesService.userHasAction(bhConstants.actions.CAN_EDIT_ROLES)
      .then(response => {
        vm.canEditRoles = response.data;
      })
      .catch(Notify.handleError);
  }

  function loadRoles() {
    vm.loading = true;
    checkRoleEditonAllowability();
    RolesService.list(session.project.id)
      .then(response => {
        vm.gridOptions.data = response.data;
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
  },
  {
    field : 'actions',
    width : 100,
    displayName : '',
    headerCellFilter : 'translate',

    cellTemplate : `modules/roles/templates/action.tmpl.html`,
  },
  ];

  // ng-click="
  vm.gridOptions = {
    appScopeProvider : vm,
    enableColumnMenus : false,
    columnDefs : columns,
    enableSorting : true,
    data : [],
    fastWatch : true,
    flatEntityAccess : true,
  };


  vm.gridOptions.onRegisterApi = function intApi(gridApi) {
    vm.gridApi = gridApi;
  };
  loadRoles();
}
