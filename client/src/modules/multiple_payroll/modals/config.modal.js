angular.module('bhima.controllers')
  .controller('ConfigPaiementModalController', ConfigPaiementModalController);

ConfigPaiementModalController.$inject = [
  '$state', 'NotifyService', 'appcache', 'EmployeeService', 'MultiplePayrollService', 'PayrollConfigurationService',
  'ExchangeRateService', 'SessionService', 'params',
];

function ConfigPaiementModalController(
  $state, Notify, AppCache, Employees, MultiplePayroll, Configuration,
  Exchange, Session, params,
) {
  const vm = this;
  vm.config = {};
  vm.payroll = {};

  vm.enterprise = Session.enterprise;
  vm.lastExchangeRate = {};

  const cache = AppCache('multiple-payroll-grid');

  if (params.isCreateState || params.uuid) {
    cache.stateParams = params;
    vm.stateParams = cache.stateParams;

  } else {
    vm.stateParams = cache.stateParams;
  }

  // exposed methods
  vm.submit = submit;
  vm.closeModal = closeModal;

  vm.latestViewFilters = MultiplePayroll.filters.formatView();

  // FIXE ME
  // Dont use index but use the property to found label, display value and value for each filter (@lomamech)
  vm.label = vm.latestViewFilters.defaultFilters[0]._label;
  vm.displayValue = vm.latestViewFilters.defaultFilters[0]._displayValue;
  vm.idPeriod = vm.latestViewFilters.defaultFilters[0]._value;
  vm.currencyId = vm.latestViewFilters.defaultFilters[1]._value;

  vm.isEnterpriseCurrency = vm.currencyId === Session.enterprise.currency_id;

  vm.payroll.currency_id = vm.latestViewFilters.defaultFilters[1]._value;

  vm.setCurrency = function setCurrency(currency) {
    vm.payroll.currency_id = currency.id;
    const isSameCurrency = currency.id === vm.lastExchangeRate.currency_id;
    const rate = isSameCurrency ? vm.lastExchangeRate.rate : (1 / vm.lastExchangeRate.rate);
    calculatePaymentWithExchangeRate(rate);
  };

  function calculatePaymentWithExchangeRate(rate) {
    vm.employee.basic_salary *= rate;

    Object.keys(vm.payroll.value).forEach((key) => {
      vm.payroll.value[key] *= rate;
    });
  }

  Employees.read(vm.stateParams.uuid)
    .then((employee) => {
      vm.employee = employee;
      vm.employee.basic_salary = vm.employee.individual_salary
        ? vm.employee.individual_salary : vm.employee.basic_salary;

      // Fixe Me: Use enterprise currency and other currency for to get exchange Rate between two Currency,
      // And Bhima Must be able to support more money @lomamech
      return Exchange.read();
    })
    .then((exchangeRate) => {
      vm.lastExchangeRate = exchangeRate.pop();

      return Employees.advantage(vm.stateParams.uuid);
    })
    .then((advantages) => {
      vm.payroll.value = {};
      vm.advantages = advantages;

      const rateCoefficient = vm.currencyId === vm.enterprise.currency_id ? 1 : vm.lastExchangeRate.rate;

      vm.employee.basic_salary *= rateCoefficient;

      vm.advantages.forEach((advantage) => {
        vm.rubConfigured.forEach((rub) => {
          if (advantage.rubric_payroll_id === rub.rubric_payroll_id) {
            vm.payroll.value[rub.abbr] = advantage.value * rateCoefficient;
          }
        });
      });
    })
    .catch(Notify.handleError);

  Configuration.read(vm.idPeriod)
    .then((period) => {
      const parameters = {
        dateFrom : period.dateFrom,
        dateTo : period.dateTo,
        employeeUuid : vm.stateParams.uuid,
      };

      vm.periodDateTo = period.dateTo;

      return MultiplePayroll.getConfiguration(vm.idPeriod, parameters);
    })
    .then((configurations) => {
      vm.configurations = configurations;
      [vm.rubConfigured] = configurations;
      vm.payroll.off_days = configurations[5] ? configurations[5].length : 0;
      vm.payroll.nb_holidays = configurations[6] ? configurations[6].length : 0;

      const workingDay = configurations[7][0].working_day - (vm.payroll.off_days + vm.payroll.nb_holidays);

      vm.payroll.working_day = workingDay;
      vm.maxWorkingDay = workingDay;

      return Employees.advantage(vm.stateParams.uuid);
    })
    .catch(Notify.handleError);

  // submit the data to the server from all two forms (update, create)
  function submit(ConfigPaiementForm) {

    if (ConfigPaiementForm.$invalid) {
      return Notify.danger('FORM.ERRORS.INVALID');
    }

    vm.payroll.employee = vm.employee;

    /* eslint-disable prefer-destructuring */
    vm.payroll.offDays = vm.configurations[5];
    vm.payroll.holidays = vm.configurations[2];
    vm.payroll.daysPeriod = vm.configurations[7][0];
    vm.payroll.iprScales = vm.configurations[4];
    /* eslint-enable prefer-destructuring */

    vm.payroll.periodDateTo = vm.periodDateTo;

    return MultiplePayroll.setConfiguration(vm.idPeriod, vm.payroll)
      .then(() => {
        Notify.success('FORM.INFO.CONFIGURED_SUCCESSFULLY');
        $state.go('multiple_payroll', null, { reload : true });
      })
      .catch(Notify.handleError);
  }

  function closeModal() {
    $state.go('multiple_payroll');
  }
}
