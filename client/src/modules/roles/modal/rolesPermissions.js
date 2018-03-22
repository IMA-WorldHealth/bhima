angular.module('bhima.controllers')
  .controller('RolesPermissionsController', RolesPermissionsController);

RolesPermissionsController.$inject = [
  'data', '$state', '$uibModalInstance', 'AppCache', 'RolesService', 'NotifyService',
];

function RolesPermissionsController(data, $state, $uibModalInstance, AppCache, RolesService, Notify) {
  const vm = this;
  vm.close = close;
  vm.role = angular.copy(data);
  vm.tree = [];
  vm.selectAll = selectAll;
  vm.allPage = 0;

  // affeted pages(permission) to this role
  vm.getAffected = getAffected;

  // vm.role.uuid
  RolesService.unit(vm.role.uuid)
    .then(res => {
      vm.tree = res.data;
    });

  // close modal
  function close() {
    $uibModalInstance.close();
  }

  function selectAll() {
    vm.tree.forEach(_module => {
      _module.affected = vm.allPage;
      _module.pages.forEach(page => {
        page.affected = vm.allPage;
      });
    });
  }

  function getAffected() {

    const ids = [];
    vm.tree.forEach(_module => {
      if (_module.affected === 1) {
        ids.push(_module.id);
      }
      _module.pages.forEach(page => {
        if (page.affected === 1) {
          ids.push(page.id);
        }
      });
    });

    const params = {
      role_uuid : vm.role.uuid,
      unit_ids : ids,
    };

    RolesService.affectPages(params)
      .then(() => {
        Notify.success('FORM.LABELS.PERMISSION_ASSIGNED_SUCCESS');
        vm.close();
      })
      .catch(Notify.handleError);
  }
}
