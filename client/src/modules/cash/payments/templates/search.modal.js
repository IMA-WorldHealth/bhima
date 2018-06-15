angular.module('bhima.controllers')
  .controller('SearchCashPaymentModalController', SearchCashPaymentModalController);

SearchCashPaymentModalController.$inject = [
  'NotifyService', '$uibModalInstance', 'filters', 'Store', 'PeriodService',
  'util', 'CashService', 'CurrencyService',
];

/**
 * Search Cash Payment controller
 *
 * @description
 * This controller powers the Cash Search modal.  Cash filters are passed in from the registry as
 * POJO and are attached to the view.  They are modified here and returned to the parent controller
 * as a POJO.
 */
function SearchCashPaymentModalController(Notify, Instance, filters, Store, Periods, util, Cash, Currencies) {
  const vm = this;
  const changes = new Store({ identifier : 'key' });

  const searchQueryOptions = [
    'is_caution', 'reference', 'cashbox_id', 'user_id', 'reference_patient',
    'currency_id', 'reversed', 'debtor_group_uuid',
  ];

  vm.searchQueries = {};
  vm.defaultQueries = {};

  // displayValues will be an id:displayValue pair
  const displayValues = {};
  const lastDisplayValues = Cash.filters.getDisplayValueMap();

  // assign already defined custom filters to searchQueries object
  vm.searchQueries = util.maskObjectFromKeys(filters, searchQueryOptions);

  // keep track of the initial search queries to make sure we properly restore
  // default display values
  const initialSearchQueries = angular.copy(vm.searchQueries);

  // assign default filters
  if (filters.limit) {
    vm.defaultQueries.limit = filters.limit;
  }

  vm.cancel = Instance.close;

  // Set up page elements data (debtor select data)
  vm.onSelectDebtor = onSelectDebtor;

  function onSelectDebtor(debtorGroup) {
    displayValues.debtor_group_uuid = debtorGroup.name;
    vm.searchQueries.debtor_group_uuid = debtorGroup.uuid;
  }

  // load all the available currencies
  Currencies.read()
    .then(currencies => {
      // cache a label for faster view rendering
      currencies.forEach(currency => {
        currency.label = Currencies.format(currency.id);
      });

      vm.currencies = currencies;
    })
    .catch(Notify.handleError);

  vm.onSelectProject = (project) => {
    displayValues.project_id = project.name;
    vm.searchQueries.project_id = project.id;
  };

  // custom filter user_id - assign the value to the searchQueries object
  vm.onSelectUser = function onSelectUser(user) {
    displayValues.user_id = user.display_name;
    vm.searchQueries.user_id = user.id;
  };

  // custom filter cashbox_id - assign the value to the searchQueries object
  vm.onSelectCashbox = function onSelectCashbox(cashbox) {
    displayValues.cashbox_id = cashbox.hrlabel;
    vm.searchQueries.cashbox_id = cashbox.id;
  };

  vm.setCurrency = function setCurrency(currencyId) {
    vm.currencies.forEach(currency => {
      if (currency.id === currencyId) {
        displayValues.currency_id = currency.label;
      }
    });
  };

  // default filter period - directly write to changes list
  vm.onSelectPeriod = function onSelectPeriod(period) {
    const periodFilters = Periods.processFilterChanges(period);

    periodFilters.forEach(filterChange => {
      changes.post(filterChange);
    });
  };

  // default filter limit - directly write to changes list
  vm.onSelectLimit = function onSelectLimit(value) {
    // input is type value, this will only be defined for a valid number
    if (angular.isDefined(value)) {
      changes.post({ key : 'limit', value });
    }
  };

  // deletes a filter from the custom filter object, this key will no longer be written to changes on exit
  vm.clear = function clear(key) {
    delete vm.searchQueries[key];
  };

  // returns the filters to the journal to be used to refresh the page
  vm.submit = function submit() {
    // push all searchQuery values into the changes array to be applied
    angular.forEach(vm.searchQueries, (value, key) => {
      if (angular.isDefined(value)) {

        // To avoid overwriting a real display value, we first determine if the value changed in the current view.
        // If so, we do not use the previous display value.  If the values are identical, we can restore the
        // previous display value without fear of data being out of date.
        const usePreviousDisplayValue =
          angular.equals(initialSearchQueries[key], value) &&
          angular.isDefined(lastDisplayValues[key]);

        // default to the raw value if no display value is defined
        const displayValue = usePreviousDisplayValue ? lastDisplayValues[key] : displayValues[key] || value;

        changes.post({ key, value, displayValue });
      }
    });

    const loggedChanges = changes.getAll();

    // return values to the CashController
    return Instance.close(loggedChanges);
  };
}
