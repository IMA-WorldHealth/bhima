angular.module('bhima.controllers')
.controller('SearchInventoriesModalController', SearchInventoriesModalController);

// dependencies injections
SearchInventoriesModalController.$inject = [
  'data','NotifyService', '$uibModalInstance', 'Store', 'PeriodService', 'util',
];

function SearchInventoriesModalController(data, Notify, Instance, Store, Periods, util) {
  var vm = this;
  var changes = new Store({identifier : 'key'});
  var searchQueryOptions = [
    'depot_uuid', 'inventory_uuid', 'status',
  ];

  vm.filters = data;
  vm.searchQueries = {};
  vm.defaultQueries = {};

  // default filter period - directly write to changes list
  vm.onSelectPeriod = function onSelectPeriod(period) {
    var periodFilters = Periods.processFilterChanges(period);

    periodFilters.forEach(function (filterChange) {
      changes.post(filterChange);
    });
  };

  // custom filter depot_uuid - assign the value to the params object
  vm.onSelectDepot = function onSelectDepot(depot) {
    vm.searchQueries.depot_uuid = depot.uuid;
  };

  // custom filter inventory_uuid - assign the value to the params object
  vm.onSelectInventory = function onSelectInventory(inventory) {
    vm.searchQueries.inventory_uuid = inventory.uuid;
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
    // push all searchQuery values into the changes array to be applied
    angular.forEach(vm.searchQueries, function (value, key) {
      if (angular.isDefined(value)) {
        changes.post({ key : key, value : value });
      }
    });

    var loggedChanges = changes.getAll();

    return Instance.close(loggedChanges);
  };

}
