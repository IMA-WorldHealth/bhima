angular.module('bhima.controllers')
  .controller('RolesPermissionsController', RolesPermissionsController);

RolesPermissionsController.$inject = [
  'data', '$state', '$uibModalInstance', 'AppCache', 'RolesService', 'NotifyService', 'Tree',
];

function RolesPermissionsController(data, $state, $uibModalInstance, AppCache, RolesService, Notify, Tree) {
  const vm = this;
  vm.close = close;
  vm.role = angular.copy(data);
  vm.tree = [];
  vm.selectAll = selectAll;
  vm.allPage = 0;
  vm.pageSelected = pageSelected;
  vm.moduleSelected = moduleSelected;
  vm.sortUnit = sortUnit;

  // affeted pages(permission) to this role
  vm.getAffected = getAffected;

  // vm.role.uuid
  RolesService.unit(vm.role.uuid)
    .then(res => {
      vm.tree = vm.sortUnit(res.data);
    });

  // cancel modal without returning success result (`dismiss`)
  function close() {
    $uibModalInstance.dismiss();
  }

  function sortUnit(units) {
    Tree.sortByTranslationKey(units);
    return units;
  }

  function pageSelected(page, _module) {
    let found = false;
    _module.pages.forEach(p => {
      // check is at least a page is selected
      if (p.affected === 1) {
        found = true;
      }
    });
    _module.affected = found ? 1 : 0;
  }

  function moduleSelected(_module) {
    _module.pages.forEach(page => {
      page.affected = _module.affected;
    });
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

        // modal action was a success `close` will return correctly
        $uibModalInstance.close();
      })
      .catch(Notify.handleError);
  }
}
