angular.module('bhima.controllers')
  .controller('ConfigPaiementModalController', ConfigPaiementModalController);

ConfigPaiementModalController.$inject = [
  '$state', 'NotifyService', 'appcache', 'EmployeeService', 'MultiplePayrollService', 'PayrollConfigurationService', 'ExchangeRateService', 'SessionService',
];

function ConfigPaiementModalController($state, Notify, AppCache, Employees, MultiplePayroll, Configuration, Exchange, Session) {
  const vm = this;
  vm.config = {};
  vm.payroll = {};
  vm.enterprise = Session.enterprise;
  vm.lastExchangeRate = {};

  const cache = AppCache('multiple-payroll-grid');
  let socialCaresLength = 0,
    taxesLength = 0,
    membershipFeeLength = 0,
    otherLength = 0;

  if ($state.params.creating || $state.params.uuid) {
    vm.stateParams = cache.stateParams = $state.params;
  } else {
    vm.stateParams = cache.stateParams;
  }

  // exposed methods
  vm.submit = submit;
  vm.closeModal = closeModal;

  vm.setCurrency = function setCurrency(currencyId) {
    vm.payroll.currency_id = currencyId;    
    let rateCurrency = currencyId === vm.lastExchangeRate.currency_id ? vm.lastExchangeRate.rate : ( 1 / vm.lastExchangeRate.rate);

    vm.employee.basic_salary *= rateCurrency;

    for(var key in vm.payroll.value){
      vm.payroll.value[key] *= rateCurrency;        
    }
  };

  Employees.read(vm.stateParams.uuid)
    .then((employee) => {
      vm.employee = employee;
      vm.latestViewFilters = MultiplePayroll.filters.formatView();

      vm.label = vm.latestViewFilters.defaultFilters[0]._label;
      vm.displayValue = vm.latestViewFilters.defaultFilters[0]._displayValue;
      vm.idPeriod = vm.latestViewFilters.defaultFilters[0]._value;
      vm.currencyId = vm.latestViewFilters.defaultFilters[1]._value;
      vm.payroll.currency_id = vm.latestViewFilters.defaultFilters[1]._value;
      vm.employee.basic_salary = vm.employee.individual_salary ? vm.employee.individual_salary : vm.employee.basic_salary;

      return Exchange.read();
    })
    .then((exchangeRate) => {
      vm.lastExchangeRate = exchangeRate.slice(-1)[0];
      return Configuration.read(vm.idPeriod);
    })
    .then((period) => {      
      const params = {
        dateFrom : period.dateFrom,
        dateTo : period.dateTo,
        employeeUuid : vm.stateParams.uuid,
      };

      return MultiplePayroll.getConfiguration(vm.idPeriod, params);
    })
    .then((configurations) => {
      vm.configurations = configurations;
      vm.rubConfigured = configurations[0];
      vm.payroll.off_days = configurations[5] ? configurations[5].length : 0;
      vm.payroll.nb_holidays = configurations[6] ? configurations[6].length : 0;
      let workingDay = configurations[7][0].working_day - (vm.payroll.off_days + vm.payroll.nb_holidays);

      vm.payroll.working_day = workingDay;
      vm.maxWorkingDay = workingDay;

      return Employees.advantage(vm.stateParams.uuid);
    })
    .then((advantages) => {
      vm.payroll.value = {};
      vm.rateCoefficient;
      vm.advantages = advantages;

      let rateCoefficient;

      if (vm.currencyId === vm.enterprise.currency_id) {
        rateCoefficient = 1;        
      } else {
        if(vm.lastExchangeRate.currency_id === vm.currencyId) {
          rateCoefficient = vm.lastExchangeRate.rate;
        }
      }

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

  // submit the data to the server from all two forms (update, create)
  function submit() {
    vm.payroll.employee = vm.employee;
    vm.payroll.offDays = vm.configurations[5];
    vm.payroll.holidays = vm.configurations[2];
    vm.payroll.daysPeriod = vm.configurations[7][0];
    vm.payroll.iprScales = vm.configurations[4];

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