angular.module('bhima.controllers')
  .controller('VoucherRegistrySearchModalController', VoucherRegistrySearchModalController);

VoucherRegistrySearchModalController.$inject = [
  '$uibModalInstance', 'filters', 'NotifyService', 'PeriodService', 'Store',
  'util', 'VoucherService',
];

/**
 * @class VoucherRegistrySearchModalController
 *
 * @description
 * This controller is responsible to collecting data from the search form and
 * returning it as a JSON object to the parent controller.  The data can be
 * preset by passing in a filters object using filtersProvider().
 */
function VoucherRegistrySearchModalController(
  ModalInstance, filters, Notify, Periods, Store, util,
  Vouchers
) {
  var vm = this;
  var changes = new Store({ identifier : 'key' });
  var searchQueryOptions = [
    'reference', 'description', 'user_id', 'type_ids', 'account_id',
  ];

  // displayValues will be an id:displayValue pair
  var displayValues = {};
  var lastDisplayValues = Vouchers.filters.getDisplayValueMap();

  vm.filters = filters;
  // searchQueries is the same id:value pair
  vm.searchQueries = {};
  vm.defaultQueries = {};

  // assign already defined custom filters to searchQueries object
  vm.searchQueries = util.maskObjectFromKeys(filters, searchQueryOptions);

  if (filters.limit) {
    vm.defaultQueries.limit = filters.limit;
  }

  vm.onTransactionTypesChange = function onTransactionTypesChange(transactionTypes) {
    var typeText = '/';
    vm.searchQueries.type_ids = transactionTypes;

    transactionTypes.forEach(function (typeId) {
      vm.transactionTypes.forEach(function (type) {
        if (typeId === type.id) {
          typeText += type.typeText.concat(' / ');
        }
      });
    });

    displayValues.type_ids = typeText;
  };

  // custom filter user_id - assign the value to the params object
  vm.onSelectUser = function onSelectUser(user) {
    vm.searchQueries.user_id = user.id;
    displayValues.user_id = user.display_name;
  };

  // default filter period - directly write to changes list
  vm.onSelectPeriod = function onSelectPeriod(period) {
    var periodFilters = Periods.processFilterChanges(period);

    periodFilters.forEach(function (filterChange) {
      changes.post(filterChange);
    });
  };

  // default filter limit - directly write to changes list
  vm.onSelectLimit = function onSelectLimit(_value) {
    // input is type value, this will only be defined for a valid number
    if (angular.isDefined(_value)) {
      changes.post({ key : 'limit', value : _value });
    }
  };

  // custom filter account_id - assign the value to the searchQueries object
  vm.onSelectAccount = function onSelectAccount(account) {
    vm.searchQueries.account_id = account.id;
    displayValues.account_id = String(account.number).concat(' - ', account.label);
  };

  // deletes a filter from the custom filter object, this key will no longer be written to changes on exit
  vm.clear = function clear(key) {
    delete vm.searchQueries[key];
  };

  vm.cancel = function cancel() { ModalInstance.close(); };

  // submit the filter object to the parent controller.
  vm.submit = function submit(form) {
    var _displayValue;
    var loggedChanges;

    if (form.$invalid) { return; }

    // delete type_ids if there is no transaction type sent
    if (vm.searchQueries.type_ids && vm.searchQueries.type_ids.length === 0) {
      vm.clear('type_ids');
    }

    // push all searchQuery values into the changes array to be applied
    angular.forEach(vm.searchQueries, function (_value, _key) {
      if (angular.isDefined(_value)) {
        // default to the original value if no display value is defined
        _displayValue = displayValues[_key] || lastDisplayValues[_key] || _value;
        changes.post({ key : _key, value : _value, displayValue : _displayValue });
      }
    });

    loggedChanges = changes.getAll();

    // return values to the voucher controller
    return ModalInstance.close(loggedChanges);
  };
}
