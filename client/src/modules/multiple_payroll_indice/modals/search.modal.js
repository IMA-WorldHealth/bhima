angular.module('bhima.controllers')
  .controller('MultiPayrollIndiceSearchModalController', MultiPayrollIndiceSearchModalController);

MultiPayrollIndiceSearchModalController.$inject = [
  '$uibModalInstance', 'filters', 'NotifyService', 'Store', 'util',
  'MultiplePayrollService', 'CurrencyService', 'PayrollConfigurationService', '$translate', 'SessionService',
];

/**
 * @class MultiPayrollIndiceSearchModalController
 *
 * @description
 * This controller is responsible to collecting data from the filter form and
 * returning it as a JSON object to the parent controller.  The data can be
 * preset by passing in a filters object using filtersProvider().
 */
function MultiPayrollIndiceSearchModalController(
  ModalInstance, filters, Notify, Store, util,
  MultiplePayroll, Currencies, Payroll, $translate, Session
) {
  const vm = this;
  vm.enterpriseCurrencyId = Session.enterprise.currency_id;

  const changes = new Store({ identifier : 'key' });
  const searchQueryOptions = [
    'payroll_configuration_id', 'currency_id',
    'display_name', 'code', 'status_id',
  ];
  const lastValues = {};

  let statusText = '/';

  // displayValues will be an id:displayValue pair
  const displayValues = {};
  const lastDisplayValues = MultiplePayroll.filters.formatView().defaultFilters;


  lastDisplayValues.forEach((last) => {
    lastValues[last._key] = last._displayValue;
  });


  vm.filters = filters;
  // searchQueries is the same id:value pair
  vm.searchQueries = {};

  // assign already defined custom filters to searchQueries object
  vm.searchQueries = util.maskObjectFromKeys(filters, searchQueryOptions);

  // load all the available currencies
  Currencies.read()
    .then((currencies) => {
      // cache a label for faster view rendering
      currencies.forEach((currency) => {
        currency.label = Currencies.format(currency.id);
      });

      vm.currencies = currencies;
    })
    .catch(Notify.handleError);

  // load all Paiement Status
  Payroll.paiementStatus()
    .then((paiementStatus) => {
      paiementStatus.forEach((item) => {
        item.plainText = $translate.instant(item.text);
      });

      vm.paiementStatus = paiementStatus;
    })
    .catch(Notify.handleError);

  vm.cancel = function cancel() { ModalInstance.close(); };

  // custom filter asign the value to the searchQueries object
  vm.onSelectPayrollPeriod = function onSelectPayrollPeriod(period) {
    vm.searchQueries.payroll_configuration_id = period.id;
    displayValues.payroll_configuration_id = period.label;
  };

  vm.setCurrency = function setCurrency(currencyId) {
    vm.currencies.forEach((currency) => {
      if (currency.id === currencyId) {
        displayValues.currency_id = currency.label;
        vm.searchQueries.currency_id = currencyId;
      }
    });
  };

  vm.onPayrollStatusChange = function onPayrollStatusChange(paiementStatus) {
    vm.searchQueries.status_id = paiementStatus;

    paiementStatus.forEach((statusId) => {
      vm.paiementStatus.forEach((status) => {
        if (statusId === status.id) {
          statusText += `${status.plainText} / `;
        }
      });
    });

    displayValues.status_id = statusText;
  };

  // deletes a filter from the custom filter object, this key will no longer be written to changes on exit
  vm.clear = function clear(key) {
    delete vm.searchQueries[key];
  };

  // submit the filter object to the parent controller.
  vm.submit = function submit(form) {
    let _displayValue;

    if (form.$invalid) { return 0; }

    // push all searchQuery values into the changes array to be applied
    angular.forEach(vm.searchQueries, (_value, _key) => {
      if (angular.isDefined(_value)) {
        // default to the original value if no display value is defined
        _displayValue = displayValues[_key] || lastValues[_key];

        changes.post({ key : _key, value : _value, displayValue : _displayValue });
      }
    });

    const loggedChanges = changes.getAll();

    // return values to the voucher controller
    return ModalInstance.close(loggedChanges);
  };
}
