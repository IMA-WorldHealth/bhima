angular.module('bhima.controllers')
  .controller('SearchOriginsModalController', SearchOriginsModalController);

// dependencies injections
SearchOriginsModalController.$inject = [
  'data', 'NotifyService',
  'util', 'Store', '$uibModalInstance', 'PeriodService'
];

function SearchOriginsModalController(data, Notify, util, Store, Instance, Periods) {

  var vm = this;
  var changes = new Store({ identifier: 'key' });

  vm.filters = data;
  vm.searchQueries = {};
  vm.defaultQueries = {};

  var searchQueryOptions = [
    'origin_uuid', 'inventory_uuid', 'label', 'entry_date_from',
    'entry_date_to', 'expiration_date_from', 'expiration_date_to', 'code'
  ];

  // default filter period - directly write to changes list
  vm.onSelectPeriod = function onSelectPeriod(period) {
    var periodFilters = Periods.processFilterChanges(period);

    periodFilters.forEach(function (filterChange) {
      changes.post(filterChange);
    });
  };

  // custom filter origin_uuid - assign the value to the params object
  vm.onSelectOrigin = function onSelectOrigin(origin) {
    vm.searchQueries.origin_uuid = origin.uuid;
  };

  // custom filter inventory_uuid - assign the value to the params object
  vm.onSelectInventory = function onSelectInventory(inventory) {
    vm.searchQueries.inventory_uuid = inventory.uuid;
  };

  // assign already defined custom filters to searchQueries object
  vm.searchQueries = util.maskObjectFromKeys(data, searchQueryOptions);

  if (data.limit) {
    vm.defaultQueries.limit = data.limit;
  }

  // default filter limit - directly write to changes list
  vm.onSelectLimit = function onSelectLimit(value) {
    // input is type value, this will only be defined for a valid number
    if (angular.isDefined(value)) {
      changes.post({ key: 'limit', value: value });
    }
  };

  // deletes a filter from the custom filter object, 
  // this key will no longer be written to changes on exit
  vm.clear = function clear(key) {
    delete vm.searchQueries[key];
  };

  vm.cancel = function cancel() { Instance.close(); };

  vm.submit = function submit(form) {
    // push all searchQuery values into the changes array to be applied
    angular.forEach(vm.searchQueries, function (value, key) {
      if (angular.isDefined(value)) {
        changes.post({ key: key, value: value });
      }
    });

    var loggedChanges = changes.getAll();
    
    return Instance.close(loggedChanges);
  }
}
