angular.module('bhima.controllers')
  .controller('UsersRolesController', UsersRolesController);

UsersRolesController.$inject = [
  'data', '$uibModal', '$uibModalInstance', 'RolesService', 'SessionService',
  'NotifyService',
];

function UsersRolesController(data, $uibModal, $uibModalInstance, RolesService, Session, Notify) {
  const vm = this;
  vm.close = close;
  vm.user = angular.copy(data);
  vm.loadRoles = loadRoles;
  vm.assignRolesToUser = assignRolesToUser;
  vm.roles = [];

  // load all roles
  function loadRoles() {
    RolesService.userRoles(vm.user.id)
      .then(response => {
        delete vm.gridOptions.data;
        vm.roles = response.data;
      })
      .catch(Notify.handleError);
  }

  // assigned role to he user
  function assignRolesToUser() {
    const codes = vm.roles
      .filter(role => role.affected === 1)
      .map(role => role.uuid);

    const param = {
      user_id : vm.user.id,
      role_uuids : codes,
    };

    RolesService.assignToUser(param)
      .then(() => {
        Notify.success('FORM.INFO.OPERATION_SUCCESS');
        vm.close();
      })
      .catch(Notify.handleError);
  }

  // ui-grid
  const columns = [{
    field : 'label',
    displayName : 'Label',
  }, {
    field : '-',
    width : 100,
    displayName : 'Affecté',
    enableFiltering : false,
    cellTemplate : 'modules/roles/templates/userAssignedRole.cell.html',
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
  };

  vm.gridOptions.onRegisterApi = gridApi => {
    vm.gridApi = gridApi;
  };

  function close() {
    $uibModalInstance.close();
  }

  vm.loadRoles();
}
