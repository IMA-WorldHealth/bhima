angular.module('bhima.controllers')
  .controller('FeeCenterModalController', FeeCenterModalController);

FeeCenterModalController.$inject = [
  '$state', 'FeeCenterService', 'ModalService', 'NotifyService', 'appcache',
];

function FeeCenterModalController($state, FeeCenter, ModalService, Notify, AppCache) {
  const vm = this;
  vm.feeCenter = {};
  vm.referenceFeeCenter = [];

  const cache = AppCache('FeeCenterModal');

  if ($state.params.creating || $state.params.id) {
    cache.stateParams = $state.params;
    vm.stateParams = cache.stateParams;
  } else {
    vm.stateParams = cache.stateParams;
  }
  vm.isCreating = vm.stateParams.creating;

  // exposed methods
  vm.submit = submit;
  vm.auxiliaryFee = auxiliaryFee;
  vm.costCenter = costCenter;
  vm.onSelectAccountReference = onSelectAccountReference;

  if (!vm.isCreating) {
    FeeCenter.read(vm.stateParams.id)
      .then((data) => {
        vm.feeCenter = data.feeCenter[0];
        processReference(data.references);
        vm.setting = true;
      })
      .catch(Notify.handleError);
  }

  function processReference(references) {
    if (references) {
      references.forEach((reference) => {
        if (reference.is_cost) {
          if (vm.feeCenter.is_principal) {
            vm.hasCostCenter = 1;
          } else {
            vm.isCostCenter = 1;
            vm.auxiliaryCenter = 1;
          }
          vm.feeCenter.is_cost = reference.is_cost;
          vm.feeCenter.reference_cost_id = reference.account_reference_id;
          vm.costCenterReference = {
            account_reference_id : reference.account_reference_id,
            is_cost : reference.is_cost,
          };
        }

        if (!reference.is_cost) {
          if (vm.feeCenter.is_principal) {
            vm.hasProfitCenter = 1;
          } else {
            vm.isProfitCenter = 1;
            vm.auxiliaryCenter = 1;
          }

          vm.feeCenter.is_cost = reference.is_cost;
          vm.feeCenter.reference_profit_id = reference.account_reference_id;
          vm.profitCenterReference = {
            account_reference_id : reference.account_reference_id,
            is_cost : reference.is_cost,
          };
        }
      });
    }
  }

  function auxiliaryFee(value) {
    vm.auxiliaryCenter = value ? 1 : 0;
    if (value) {
      vm.hasProfitCenter = !value;
      vm.hasCostCenter = !value;
    }

    if (vm.auxiliaryCenter) {
      vm.isCostCenter = 0;
      vm.isProfitCenter = 0;
    }
  }

  function onSelectAccountReference(accountReference, isCostCenter) {
    if (isCostCenter) {
      vm.costCenterReference = {
        account_reference_id : accountReference.id,
        is_cost : isCostCenter,
      };
    } else {
      vm.profitCenterReference = {
        account_reference_id : accountReference.id,
        is_cost : isCostCenter,
      };
    }
  }

  function costCenter(value) {
    vm.isCostCenter = value;
    vm.isProfitCenter = !value;
  }

  // submit the data to the server from all two forms (update, create)
  function submit(feeCenterForm) {
    if (feeCenterForm.$invalid) { return 0; }

    if (vm.isCostCenter || vm.hasCostCenter) {
      vm.referenceFeeCenter.push(vm.costCenterReference);
    }

    if (vm.isProfitCenter || vm.hasProfitCenter) {
      vm.referenceFeeCenter.push(vm.profitCenterReference);
    }

    const data = {
      label : vm.feeCenter.label,
      is_principal : vm.feeCenter.is_principal,
      reference_fee_center : vm.referenceFeeCenter,
    };

    const promise = (vm.isCreating)
      ? FeeCenter.create(data)
      : FeeCenter.update(vm.feeCenter.id, data);

    return promise
      .then(() => {
        const translateKey = (vm.isCreating) ? 'FORM.INFO.CREATE_SUCCESS' : 'FORM.INFO.UPDATE_SUCCESS';
        Notify.success(translateKey);
        $state.go('fee_center', null, { reload : true });
      })
      .catch(Notify.handleError);
  }
}
