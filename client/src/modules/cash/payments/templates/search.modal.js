angular.module('bhima.controllers')
  .controller('SearchCashPaymentModalController', SearchCashPaymentModalController);

SearchCashPaymentModalController.$inject = [
  'NotifyService', '$uibModalInstance', 'filters', 'Store', 'PeriodService', 'util', 'CashService', 'CurrencyService',
];

/**
 * Search Cash Payment controller
 *
 * @description
 * This controller powers the Invoice Search modal.  Invoices are passed in from the registry as
 * POJO and are attached to the view.  They are modified here and returned to the parent controller
 * as a POJO.
 */
function SearchCashPaymentModalController(Notify, Instance, filters, Store, Periods, util, Cash, Currencies) {
  var vm = this;
  var changes = new Store({ identifier : 'key' });
  // @TODO ideally these should be passed in when the modal is initialised
  //       these are known when the filter service is defined
  var searchQueryOptions = [
    'is_caution', 'reference', 'cashbox_id', 'user_id', 'reference_patient', 'currency_id', 'reversed', 'debtor_group_uuid',
  ];

  vm.filters = filters;

  vm.searchQueries = {};
  vm.defaultQueries = {};

  // displayValues will be an id:displayValue pair
  var displayValues = {};
  var lastDisplayValues = Cash.filters.getDisplayValueMap();

  // assign already defined custom filters to searchQueries object
  vm.searchQueries = util.maskObjectFromKeys(filters, searchQueryOptions);

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
    .then(function (currencies) {
      // cache a label for faster view rendering
      currencies.forEach(function (currency) {
        currency.label = Currencies.format(currency.id);
      });

      vm.currencies = currencies;
    })
    .catch(Notify.handleError);


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
    vm.currencies.forEach(function (currency) {
      if (currency.id === currencyId) {
        displayValues.currency_id = currency.label;
      }
    });
  };

  // default filter period - directly write to changes list
  vm.onSelectPeriod = function onSelectPeriod(period) {
    var periodFilters = Periods.processFilterChanges(period);

    periodFilters.forEach(function (filterChange) {
      changes.post(filterChange);
    });
  };

  // default filter limit - directly write to changes list
  vm.onSelectLimit = function onSelectLimit(value) {
    // input is type value, this will only be defined for a valid number
    if (angular.isDefined(value)) {
      changes.post({ key : 'limit', value : value });
    }
  };


  // deletes a filter from the custom filter object, this key will no longer be written to changes on exit
  vm.clear = function clear(key) {
    delete vm.searchQueries[key];
  };

  // returns the filters to the journal to be used to refresh the page
  vm.submit = function submit() {
    // push all searchQuery values into the changes array to be applied
    angular.forEach(vm.searchQueries, function (value, key) {
      if (angular.isDefined(value)) {
        // default to the original value if no display value is defined
        var displayValue = displayValues[key] || lastDisplayValues[key] || value;
        changes.post({ key: key, value: value, displayValue: displayValue });
       }
    });

    var loggedChanges = changes.getAll();

    // return values to the CashController
    return Instance.close(loggedChanges);
  };
}
