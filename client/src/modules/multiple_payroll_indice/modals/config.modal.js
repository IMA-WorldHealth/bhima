angular.module('bhima.controllers')
  .controller('ConfigIndicePaiementModalController', ConfigIndicePaiementModalController);

ConfigIndicePaiementModalController.$inject = [
  '$state', 'NotifyService', 'appcache', 'EmployeeService',
  'MultipleIndicesPayrollService', 'PayrollConfigurationService',
  'ExchangeRateService', 'SessionService', 'params',
];

function ConfigIndicePaiementModalController(
  $state, Notify, AppCache, Employees, MultiplePayroll, Configuration,
  Exchange, Session, params,
) {
  const vm = this;
  vm.config = {};
  vm.payroll = {};
  vm.employee = {};
  vm.rubrics = [];
  const rubricsMap = {};
  vm.selectedRubrics = {};
  vm.enterprise = Session.enterprise;
  vm.lastExchangeRate = {};

  const cache = AppCache('multiple-indice-payroll-grid');

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
  };

  // initialize module
  function startup() {
    if (params.filters.length) {
      MultiplePayroll.filters.replaceFiltersFromState(params.filters);
      MultiplePayroll.cacheFilters();
    }

    vm.latestViewFilters = MultiplePayroll.filters.formatView();

    const parameters = MultiplePayroll.filters.formatHTTP(true);
    parameters.employee_uuid = parameters.uuid;
    load(parameters);

  }

  function load(filters) {
    MultiplePayroll.read(null, filters)
      .then((result) => {
        vm.employee = result.employees[0] || {};

        vm.employee.rubrics.forEach(r => {
          vm.selectedRubrics[r.rubric_id] = r.rubric_value;
        });
        vm.rubrics = result.rubrics;
        vm.rubrics.forEach(r => {
          rubricsMap[r.id] = r;
          if (!vm.selectedRubrics[r.id]) {
            vm.selectedRubrics[r.id] = r.value || 0;
          }
        });
      })
      .catch(Notify.handleError);
  }

  function formatRubrics(object) {
    const keys = Object.keys(vm.selectedRubrics);
    return keys.map(k => {
      return {
        id : k,
        value : object[k],
        is_monetary : rubricsMap[k].is_monetary_value,
      };
    });
  }

  // submit the data to the server from all two forms (update, create)
  function submit(ConfigPaiementForm) {

    if (ConfigPaiementForm.$invalid) {
      return Notify.danger('FORM.ERRORS.INVALID');
    }

    const data = MultiplePayroll.filters.formatHTTP(true);

    angular.extend(data, {
      rubrics : formatRubrics(vm.selectedRubrics),
      employee_uuid : params.uuid,
    });

    return MultiplePayroll.create(data)
      .then(() => {
        Notify.success('FORM.INFO.OPERATION_SUCCESS');
        closeModal();
      })
      .catch(Notify.handleError);

  }

  function closeModal() {
    $state.go('multiple_payroll_indice', null, { reload : true });
  }

  startup();
}
