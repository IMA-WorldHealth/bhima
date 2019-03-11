
angular.module('bhima.controllers')
  .controller('HospitalizationIndicatorModalController', HospitalizationIndicatorModalController);


HospitalizationIndicatorModalController.$inject = [
  '$uibModalInstance', 'NotifyService',
  'IndicatorService',
];

function HospitalizationIndicatorModalController(Instance, Notify, Indicators) {
  const vm = this;
  vm.hospitalIndicator = {};
  vm.service = {};
  vm.period = {};
  vm.fiscal_id = null;
  vm.close = Instance.close;

  // let load status
  Indicators.status.read().then(status => {
    vm.status = status;
  }).catch(Notify.handleError);

  vm.onSelectService = (service) => {
    vm.hospitalIndicator.service_id = service.id;
    vm.service = service;
  };
  // fire when an input changed
  vm.onInputTextChange = (key, value) => {
    vm.hospitalIndicator[key] = value;
  };
  vm.onSelectFiscalYear = (fiscalYear) => {
    vm.fiscal_id = fiscalYear.id;
  };
  vm.onSelectPeriod = (period) => {
    vm.period = period;
    vm.hospitalIndicator.period_id = period.id;
  };

  vm.submit = (form) => {
    if (form.$invalid) {
      Notify.danger('FORM.ERRORS.HAS_ERRORS');
      return;
    }

    Indicators.hospitalization.create(vm.hospitalIndicator).then(() => {
      Notify.success('FORM.INFO.OPERATION_SUCCESS');
      return Instance.close(true);
    }).catch(Notify.handleError);
  };

  vm.onSelectStatus = (selectedStatus) => {
    vm.hospitalIndicator.status_id = selectedStatus.id;
  };
}
