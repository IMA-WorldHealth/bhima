angular.module('bhima.controllers')
.controller('SearchInventoriesModalController', SearchInventoriesModalController);

// dependencies injections
SearchInventoriesModalController.$inject = [
  'data','NotifyService', '$uibModalInstance', 'Store', 'PeriodService', 'util', 'StockService',
];

function SearchInventoriesModalController(data, Notify, Instance, Store, Periods, util, Stock) {
  var vm = this;
  var changes = new Store({identifier : 'key'});
  var searchQueryOptions = [
    'depot_uuid', 'inventory_uuid', 'status', 'require_po',
  ];

  vm.filters = data;
  vm.searchQueries = {};
  vm.defaultQueries = {};

  // displayValues will be an id:displayValue pair
  var displayValues = {};

  // default filter period - directly write to changes list
  vm.onSelectPeriod = function onSelectPeriod(period) {
    var periodFilters = Periods.processFilterChanges(period);

    periodFilters.forEach(function (filterChange) {
      changes.post(filterChange);
    });
  };

  var lastViewFilters = Stock.filter.inventory.formatView().customFilters;

  // map key to last display value for lookup in loggedChange
  var lastDisplayValues = lastViewFilters.reduce(function (object, filter) {
    object[filter._key] = filter.displayValue;
    return object;
  }, {});

  // custom filter depot_uuid - assign the value to the params object
  vm.onSelectDepot = function onSelectDepot(depot) {
    vm.searchQueries.depot_uuid = depot.uuid;
    displayValues.depot_uuid = depot.text;
  };

  // custom filter inventory_uuid - assign the value to the params object
  vm.onSelectInventory = function onSelectInventory(inventory) {
    vm.searchQueries.inventory_uuid = inventory.uuid;
    displayValues.inventory_uuid = inventory.label;
  };

  // default filter limit - directly write to changes list
  vm.onSelectLimit = function onSelectLimit(value) {
    // input is type value, this will only be defined for a valid number
    if (angular.isDefined(value)) {
      changes.post({ key : 'limit', value : value });
    }
  };

  // deletes a filter from the custom filter object,
  // this key will no longer be written to changes on exit
  vm.clear = function clear(key) {
    delete vm.searchQueries[key];
  };

  // assign already defined custom filters to searchQueries object
  vm.searchQueries = util.maskObjectFromKeys(data, searchQueryOptions);

  if (data.limit) {
    vm.defaultQueries.limit = data.limit;
  } 

  vm.cancel = function cancel() { Instance.close(); };

  vm.submit = function submit() {
    // Set the label of status Value
    if (vm.searchQueries.status) {
      displayValues.status = Stock.statusLabelMap(vm.searchQueries.status);
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

    return Instance.close(loggedChanges);
  };

}
