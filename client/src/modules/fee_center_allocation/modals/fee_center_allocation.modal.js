angular.module('bhima.controllers')
  .controller('FeeCenterAllocationModalController', FeeCenterAllocationModalController);

FeeCenterAllocationModalController.$inject = [
  '$state', 'FeeCenterAllocationService', 'ModalService', 'NotifyService',
  'appcache', 'bhConstants', 'params', '$translate',
];

function FeeCenterAllocationModalController($state, FeeCenterAllocation, ModalService, Notify,
  AppCache, bhConstants, params, $translate) {
  const vm = this;
  vm.feeCenter = {};
  vm.referenceFeeCenterAllocation = [];
  vm.allocationMethodOptions = bhConstants.stepDownAllocation.METHOD_OPTIONS;

  const cache = AppCache('FeeCenterAllocationModal');

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
  vm.translate = translateAllocationBasisOption;

  if (vm.isCreateState) {
    // Use first allocation method as default
    [vm.feeCenter.allocation_method] = vm.allocationMethodOptions;
  } else {
    FeeCenterAllocation.read(vm.stateParams.id)
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

  FeeCenterAllocation.getAllocationBases()
    .then((bases) => {
      // Translate the basis terms, if possible
      bases.forEach(base => {
        if (FeeCenterAllocation.isTranslationToken(base.name)) {
          base.name = $translate.instant(`FORM.LABELS.${base.name}`);
          if (base.units) {
            base.name += ` (${base.units})`;
          }
        }
        if (FeeCenterAllocation.isTranslationToken(base.description)) {
          base.description = $translate.instant(`FORM.LABELS.${base.description}`);
        }
      });
      vm.allocationBases = bases;
    })
    .catch(Notify.handleError);

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

  function translateAllocationBasisOption(option) {
    return $translate.instant(`FORM.LABELS.ALLOCATION_METHOD_${option.toUpperCase()}`);
  }

  // submit the data to the server from all two forms (update, create)
  function submit(feeCenterForm) {
    if (feeCenterForm.$invalid) { return 0; }

    if (vm.isCostCenter || vm.hasCostCenter) {
      if (vm.variableCostCenterReference) {
        vm.referenceFeeCenterAllocation.push(vm.variableCostCenterReference);
      }

      if (vm.fixCostCenterReference) {
        vm.referenceFeeCenterAllocation.push(vm.fixCostCenterReference);
      }
    }

    if (vm.isProfitCenter || vm.hasProfitCenter) {
      if (vm.turnoverProfitCenterReference) {
        vm.referenceFeeCenterAllocation.push(vm.turnoverProfitCenterReference);
      }

      if (vm.otherProfitCenterReference) {
        vm.referenceFeeCenterAllocation.push(vm.otherProfitCenterReference);
      }
    }

    const data = {
      label : vm.feeCenter.label,
      is_principal : vm.feeCenter.is_principal,
      reference_fee_center : vm.referenceFeeCenterAllocation,
      services : vm.services,
      project_id : vm.feeCenter.project_id,
      allocation_method : vm.feeCenter.allocation_method,
      allocation_basis_id : vm.feeCenter.allocation_basis.id,
    };

    const promise = (vm.isCreateState)
      ? FeeCenterAllocation.create(data)
      : FeeCenterAllocation.update(vm.feeCenter.id, data);

    return promise
      .then(() => {
        const translateKey = (vm.isCreateState) ? 'FORM.INFO.CREATE_SUCCESS' : 'FORM.INFO.UPDATE_SUCCESS';
        Notify.success(translateKey);
        $state.go('fee_center', null, { reload : true });
      })
      .catch(Notify.handleError);
  }
}
