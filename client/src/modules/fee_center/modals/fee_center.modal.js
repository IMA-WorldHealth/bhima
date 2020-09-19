angular.module('bhima.controllers')
  .controller('FeeCenterModalController', FeeCenterModalController);

FeeCenterModalController.$inject = [
  '$state', 'FeeCenterService', 'ModalService', 'NotifyService', 'appcache', 'params',
];

function FeeCenterModalController($state, FeeCenter, ModalService, Notify, AppCache, params) {
  const vm = this;
  vm.feeCenter = {};
  vm.referenceFeeCenter = [];

  const cache = AppCache('FeeCenterModal');

  if (params.isCreateState || params.id) {
    cache.stateParams = params;
    vm.stateParams = cache.stateParams;
  } else {
    vm.stateParams = cache.stateParams;
  }

  vm.isCreateState = vm.stateParams.isCreateState;

  // exposed methods
  vm.submit = submit;
  vm.auxiliaryFee = auxiliaryFee;
  vm.costCenter = costCenter;
  vm.onSelectAccountReference = onSelectAccountReference;
  vm.onSelectProject = onSelectProject;

  vm.onServicesChange = onServicesChange;
  vm.clear = clear;
  vm.reset = reset;

  if (!vm.isCreateState) {
    FeeCenter.read(vm.stateParams.id)
      .then((data) => {
        [vm.feeCenter] = data.feeCenter;
        if (data.services) {
          vm.relatedServices = data.services.length ? 1 : 0;
          vm.assignedProject = data.feeCenter[0].project_id ? 1 : 0;
          vm.services = data.services;
        }

        processReference(data.references);
        vm.setting = true;
      })
      .catch(Notify.handleError);
  }

  function processReference(references) {
    if (references) {
      references.forEach((reference) => {
        const feeCenterReferenceBundle = {
          account_reference_id : reference.account_reference_id,
          is_cost : reference.is_cost,
          is_variable : reference.is_variable,
          is_turnover : reference.is_turnover,
        };

        if (reference.is_cost) {
          if (vm.feeCenter.is_principal) {
            vm.hasCostCenter = 1;
          } else {
            vm.isCostCenter = 1;
            vm.auxiliaryCenter = 1;
          }
          vm.feeCenter.is_cost = reference.is_cost;

          if (reference.is_variable) {
            vm.feeCenter.reference_cost_variable_id = reference.account_reference_id;
            vm.variableCostCenterReference = feeCenterReferenceBundle;
          } else {
            vm.feeCenter.reference_cost_fixed_id = reference.account_reference_id;
            vm.fixCostCenterReference = feeCenterReferenceBundle;
          }
        }

        if (!reference.is_cost) {
          if (vm.feeCenter.is_principal) {
            vm.hasProfitCenter = 1;
          } else {
            vm.isProfitCenter = 1;
            vm.auxiliaryCenter = 1;
          }

          if (reference.is_turnover) {
            vm.feeCenter.reference_profit_turnover_id = reference.account_reference_id;
            vm.turnoverProfitCenterReference = feeCenterReferenceBundle;
          } else {
            vm.feeCenter.reference_other_profit_id = reference.account_reference_id;
            vm.otherProfitCenterReference = feeCenterReferenceBundle;
          }
        }
      });
    }
  }

  function clear(value, index) {
    vm[value] = null;
    vm.feeCenter[index] = null;

    delete vm[value];
    delete vm.feeCenter[index];
  }

  function reset(value) {
    vm.feeCenter[value] = null;
  }

  function auxiliaryFee(value) {
    vm.auxiliaryCenter = value ? 1 : 0;
    if (value) {
      vm.hasProfitCenter = !value;
      vm.hasCostCenter = !value;
      vm.isCostCenter = 0;
      vm.isProfitCenter = 0;
    }
  }

  function onSelectAccountReference(accountReference, isCostCenter, isVariable, isTurnOver) {
    const config = {
      account_reference_id : accountReference.id,
      is_cost : isCostCenter,
      is_variable : isVariable,
      is_turnover : isTurnOver,
    };

    if (isCostCenter && isVariable) {
      vm.variableCostCenterReference = config;
    } else if (isCostCenter && !isVariable) {
      vm.fixCostCenterReference = config;
    } else if (!isCostCenter && isTurnOver) {
      vm.turnoverProfitCenterReference = config;
    } else if (!isCostCenter && !isTurnOver) {
      vm.otherProfitCenterReference = config;
    }
  }

  function costCenter(value) {
    vm.isCostCenter = value;
    vm.isProfitCenter = !value;
  }

  function onServicesChange(services) {
    vm.services = services;
  }

  function onSelectProject(project) {
    vm.feeCenter.project_id = project.id;
  }

  // submit the data to the server from all two forms (update, create)
  function submit(feeCenterForm) {
    if (feeCenterForm.$invalid) { return 0; }

    if (vm.isCostCenter || vm.hasCostCenter) {
      if (vm.variableCostCenterReference) {
        vm.referenceFeeCenter.push(vm.variableCostCenterReference);
      }

      if (vm.fixCostCenterReference) {
        vm.referenceFeeCenter.push(vm.fixCostCenterReference);
      }
    }

    if (vm.isProfitCenter || vm.hasProfitCenter) {
      if (vm.turnoverProfitCenterReference) {
        vm.referenceFeeCenter.push(vm.turnoverProfitCenterReference);
      }

      if (vm.otherProfitCenterReference) {
        vm.referenceFeeCenter.push(vm.otherProfitCenterReference);
      }
    }

    const data = {
      label : vm.feeCenter.label,
      is_principal : vm.feeCenter.is_principal,
      reference_fee_center : vm.referenceFeeCenter,
      services : vm.services,
      project_id : vm.feeCenter.project_id,
    };

    const promise = (vm.isCreateState)
      ? FeeCenter.create(data)
      : FeeCenter.update(vm.feeCenter.id, data);

    return promise
      .then(() => {
        const translateKey = (vm.isCreateState) ? 'FORM.INFO.CREATE_SUCCESS' : 'FORM.INFO.UPDATE_SUCCESS';
        Notify.success(translateKey);
        $state.go('fee_center', null, { reload : true });
      })
      .catch(Notify.handleError);
  }
}
