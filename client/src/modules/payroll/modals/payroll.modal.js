angular.module('bhima.controllers')
  .controller('PayrollConfigModalController', PayrollConfigModalController);

PayrollConfigModalController.$inject = [
  '$state', 'PayrollConfigurationService', 'NotifyService', 'appcache', 'moment',
];

function PayrollConfigModalController($state, PayrollConfigurations, Notify, AppCache, moment) {
  const vm = this;

  vm.payroll = {};

  const cache = AppCache('PayrollModal');

  if ($state.params.creating || $state.params.id) {
    vm.stateParams = $state.params;
    cache.stateParams = $state.params;
  } else {
    vm.stateParams = cache.stateParams;
  }

  vm.isCreating = vm.stateParams.creating;

  // exposed methods
  vm.submit = submit;
  vm.onSelectRubricConfig = onSelectRubricConfig;
  vm.onSelectAccountConfig = onSelectAccountConfig;
  vm.onSelectIprConfig = onSelectIprConfig;
  vm.onSelectWeekendConfig = onSelectWeekendConfig;
  vm.onSelectEmployeeConfig = onSelectEmployeeConfig;

  vm.clear = clear;

  if (!vm.isCreating) {
    PayrollConfigurations.read(vm.stateParams.id)
      .then(payroll => {
        payroll.dateFrom = new Date(payroll.dateFrom);
        payroll.dateTo = new Date(payroll.dateTo);
        vm.payroll = payroll;
      })
      .catch(Notify.handleError);
  }

  // callback for Rubric Configuration select
  function onSelectRubricConfig(rubric) {
    vm.payroll.config_rubric_id = rubric.id;
  }

  // callback for Account Configuration select
  function onSelectAccountConfig(account) {
    vm.payroll.config_accounting_id = account.id;
  }

  // callback for Ipr Configuration select
  function onSelectIprConfig(ipr) {
    vm.payroll.config_ipr_id = ipr.id;
  }

  // Callback for weekend configuration select
  function onSelectWeekendConfig(week) {
    vm.payroll.config_weekend_id = week.id;
  }

  function onSelectEmployeeConfig(employee) {
    vm.payroll.config_employee_id = employee.id;
  }

  // deletes a filter from the custom filter object
  function clear(key) {
    delete vm.payroll[key];
  }

  // submit the data to the server from all two forms (update, create)
  function submit(payrollForm) {
    if (payrollForm.$invalid) { return 0; }

    vm.payroll.dateFrom = moment(vm.payroll.dateFrom).format('YYYY-MM-DD');
    vm.payroll.dateTo = moment(vm.payroll.dateTo).format('YYYY-MM-DD');

    const promise = (vm.isCreating) ?
      PayrollConfigurations.create(vm.payroll) :
      PayrollConfigurations.update(vm.payroll.id, vm.payroll);

    return promise
      .then(() => {
        const translateKey = (vm.isCreating) ? 'FORM.INFO.CREATE_SUCCESS' : 'FORM.INFO.UPDATE_SUCCESS';
        Notify.success(translateKey);
        $state.go('payroll', null, { reload : true });
      })
      .catch(Notify.handleError);
  }
}
