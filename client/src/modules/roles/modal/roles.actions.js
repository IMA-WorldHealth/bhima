angular.module('bhima.controllers').controller('RoleActionsController', RoleActionsController);
RoleActionsController.$inject = [
  'data', '$uibModal', '$uibModalInstance',
  'RolesService', 'SessionService', 'NotifyService',
];

function RoleActionsController(data, $uibModal, $uibModalInstance, RolesService, session, Notify) {
  const vm = this;
  vm.close = close;
  vm.role = angular.copy(data);
  vm.loadRoles = loadRoles;
  vm.assignActionToRole = assignActionToRole;
  vm.actions = [];

  // loa all roles
  function loadRoles() {
    RolesService.actions(vm.role.uuid)
      .then(response => {
        vm.actions = response.data;
      })
      .catch(Notify.handleError);
  }

  // assigned actions to a role
  function assignActionToRole() {
    const ids = vm.actions
      .filter(action => action.affected === 1)
      .map(action => action.id);

    const param = {
      role_uuid : vm.role.uuid,
      action_ids : [...ids],
    };
    RolesService.assignActions(param)
      .then(() => {
        Notify.success('FORM.INFO.OPERATION_SUCCESS');
        vm.close();
      }).catch(Notify.handleError);
  }

  function close() {
    $uibModalInstance.close();
  }

  vm.loadRoles();
}
