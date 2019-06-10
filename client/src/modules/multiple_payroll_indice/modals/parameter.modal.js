angular.module('bhima.controllers')
  .controller('MultiPayrollIndiceParamModalController', MultiPayrollIndiceParamModalController);

MultiPayrollIndiceParamModalController.$inject = [
  'NotifyService', 'MultipleIndicesPayrollService', '$uibModalInstance',
];

function MultiPayrollIndiceParamModalController(Notify, MultiplePayroll, Instance) {
  const vm = this;
  vm.close = Instance.close;
  vm.param = {};
  vm.onInputTextChange = (key, val) => {
    vm.param[key] = val;
  };

  vm.onSelectPayrollPeriod = (payrollConfig) => {
    vm.param.payroll_configuration_id = payrollConfig.id;
    MultiplePayroll.parameters.read(payrollConfig.id).then(parameter => {
      vm.param = parameter;
    });
  };

  vm.submit = (form) => {
    if (form.$invalid) { return 0; }
    return MultiplePayroll.parameters.create(vm.param).then(() => {
      Notify.success('FORM.INFO.OPERATION_SUCCESS');
      return vm.close(true);
    })
      .catch(Notify.handleError);
  };

}
