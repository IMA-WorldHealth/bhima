angular.module('bhima.controllers')
  .controller('VoucherRegistrySearchModalController', VoucherRegistrySearchModalController);

VoucherRegistrySearchModalController.$inject = [
  '$uibModalInstance', 'filters', 'NotifyService', 'moment', 'PeriodService', 'Store', 'util', 
  'TransactionTypeService', '$translate', 'VoucherService',
];

/**
 * @class VoucherRegistrySearchModalController
 *
 * @description
 * This controller is responsible to collecting data from the search form and
 * returning it as a JSON object to the parent controller.  The data can be
 * preset by passing in a filters object using filtersProvider().
 */
function VoucherRegistrySearchModalController(ModalInstance, filters, Notify, moment, Periods, Store, util, 
  TransactionTypes, $translate, Vouchers) {
  var vm = this;
  var changes = new Store({ identifier : 'key' });
  var searchQueryOptions = [
    'reference', 'description', 'user_id', 'type_ids',
  ];

  vm.filters = filters;
  // searchQueries is the same id:value pair
  vm.searchQueries = {};

  vm.defaultQueries = {};

  var lastViewFilters = Vouchers.filters.formatView().customFilters;

  // map key to last display value for lookup in loggedChange
  var lastDisplayValues = lastViewFilters.reduce(function (object, filter) {
    object[filter._key] = filter.displayValue;
    return object;
  }, {});  

  // displayValues will be an id:displayValue pair
  var displayValues = {};
  
  // assign already defined custom filters to searchQueries object
  vm.searchQueries = util.maskObjectFromKeys(filters, searchQueryOptions);

  // load all Transaction types
  TransactionTypes.read()
    .then(function (types) {
      types.forEach(function (item) {
        item.typeText = $translate.instant(item.text);
      });
      vm.transactionTypes = types;
    })
    .catch(Notify.handleError);

  if (filters.limit) {
    vm.defaultQueries.limit = filters.limit;
  }

  vm.onTransactionTypesChange = function onTransactionTypesChange(transactionTypes) {
    vm.searchQueries.type_ids = transactionTypes;
    var typeText = '/';

    transactionTypes.forEach(function (typeId) {
      vm.transactionTypes.forEach(function (type) {
        if (typeId === type.id) {
          typeText += type.typeText + ' / ';
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

  vm.cancel = function cancel() { ModalInstance.close(); };

  // submit the filter object to the parent controller.
  vm.submit = function submit(form) {
    // delete type_ids if there is no transaction type sent
    if (vm.searchQueries.type_ids && vm.searchQueries.type_ids.length === 0) {
      vm.clear('type_ids');
    }

    // push all searchQuery values into the changes array to be applied
    angular.forEach(vm.searchQueries, function (value, key) {
      if (angular.isDefined(value)) {
        // default to the original value if no display value is defined
        var displayValue = displayValues[key] || lastDisplayValues[key] || value;
        changes.post({ key: key, value: value, displayValue: displayValue });
       }
    });

    var loggedChanges = changes.getAll();

    // return values to the voucher controller
    return ModalInstance.close(loggedChanges);
  };
}
