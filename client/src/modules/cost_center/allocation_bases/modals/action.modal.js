angular.module('bhima.controllers')
  .controller('CCAllocationBasisModalController', CCAllocationBasisModalController);

CCAllocationBasisModalController.$inject = [
  '$state', 'AllocationBasisService', 'AllocationBasisQuantityService',
  'NotifyService', 'params', 'appcache',
];

function CCAllocationBasisModalController(
  $state, AllocationBasis, AllocationBasisQuantity,
  Notify, params, AppCache,
) {
  const vm = this;

  const cache = AppCache('CostCenterAllocationBasisModal');

  if (params.isCreateState || params.id) {
    cache.stateParams = params;
    vm.stateParams = cache.stateParams;
  } else {
    vm.stateParams = cache.stateParams;
  }

  vm.costCenterId = params.id;
  vm.costCenter = {};

  vm.isCreateState = vm.stateParams.isCreateState;
  vm.ccAllocation = {};

  vm.onSelectCostCenter = onSelectCostCenter;
  vm.submit = submit;

  function onSelectCostCenter(cc) {
    vm.costCenter = cc;
    vm.costCenterId = cc.id;
  }

  function load() {
    loadAllocationBasis()
      .then(() => {
        if (!vm.isCreateState) { loadAllocationBasisQuantity(); }
      })
      .catch(Notify.handleError);
  }

  function loadAllocationBasis() {
    return AllocationBasis.read(null, { cost_center_id : vm.costCenterId })
      .then(result => {
        vm.allocationBases = result || {};
      });
  }

  function loadAllocationBasisQuantity() {
    return AllocationBasisQuantity.bulkDetails(vm.costCenterId)
      .then(result => {
        vm.ccAllocation = result.reduce((current, item) => {
          current[item.allocation_basis_label] = item.quantity;
          return current;
        }, {});
      });
  }

  function getInsertData() {
    const baseMap = vm.allocationBases.reduce((current, item) => {
      current[item.name] = item.id;
      return current;
    }, {});

    const insert = Object.keys(vm.ccAllocation)
      .map((key) => ({
        cost_center_id : vm.costCenterId,
        basis_id : baseMap[key],
        quantity : vm.ccAllocation[key],
      }));

    return insert;
  }

  function submit(form) {
    if (form.$invalid) { return; }

    const data = getInsertData();
    const request = vm.isCreateState
      ? AllocationBasisQuantity.bulkInsert(data)
      : AllocationBasisQuantity.bulkUpdate(params.id, data);

    request
      .then(() => {
        Notify.success(vm.isCreateState ? 'FORM.INFO.CREATE_SUCCESS' : 'FORM.INFO.UPDATE_SUCCESS');
        $state.go('cost_center_allocation_bases', null, { reload : true });
      })
      .catch(Notify.handleError);
  }

  load();
}
