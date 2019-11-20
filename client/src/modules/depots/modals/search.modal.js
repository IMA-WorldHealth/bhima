angular.module('bhima.controllers')
  .controller('SearchDepotModalController', SearchDepotModalController);

SearchDepotModalController.$inject = [
  'data', '$uibModalInstance', 'Store', 'util', 'StockService',
];

function SearchDepotModalController(data, Instance, Store, util, Stock) {
  const vm = this;
  const displayValues = {};
  const changes = new Store({ identifier : 'key' });

  const searchQueryOptions = ['text'];

  vm.filters = data;

  vm.searchQueries = {};
  vm.defaultQueries = {};

  // keep track of the initial search queries to make sure we properly restore
  // default display values
  const initialSearchQueries = angular.copy(vm.searchQueries);

  // map key to last display value for lookup in loggedChange
  const lastDisplayValues = Stock.filter.depot.getDisplayValueMap();

  // assign already defined custom filters to searchQueries object
  vm.searchQueries = util.maskObjectFromKeys(data, searchQueryOptions);

  if (data.limit) {
    vm.defaultQueries.limit = data.limit;
  }

  // default filter limit - directly write to changes list
  vm.onSelectLimit = function onSelectLimit(_value) {
    // input is type value, this will only be defined for a valid number
    if (angular.isDefined(_value)) {
      changes.post({ key : 'limit', value : _value });
    }
  };

  // deletes a filter from the custom filter object,
  // this key will no longer be written to changes on exit
  vm.clear = function clear(key) {
    delete vm.searchQueries[key];
  };

  vm.cancel = function cancel() { Instance.close(); };

  vm.submit = function submit() {

    // push all searchQuery values into the changes array to be applied
    angular.forEach(vm.searchQueries, (value, key) => {
      if (angular.isDefined(value)) {

        // To avoid overwriting a real display value, we first determine if the value changed in the current view.
        // If so, we do not use the previous display value.  If the values are identical, we can restore the
        // previous display value without fear of data being out of date.
        const usePreviousDisplayValue = angular.equals(initialSearchQueries[key], value)
        && angular.isDefined(lastDisplayValues[key]);

        // default to the raw value if no display value is defined
        const displayValue = usePreviousDisplayValue ? lastDisplayValues[key] : displayValues[key] || value;

        changes.post({ key, value, displayValue });
      }
    });

    const loggedChanges = changes.getAll();
    return Instance.close(loggedChanges);
  };
}
