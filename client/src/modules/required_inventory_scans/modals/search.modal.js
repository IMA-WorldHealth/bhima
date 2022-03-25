angular.module('bhima.controllers')
  .controller('RequiredInventoryScansSearchModalController', RequiredInventoryScansSearchModalController);

// dependencies injections
RequiredInventoryScansSearchModalController.$inject = [
  'data', 'util', 'Store', '$uibModalInstance', 'StockService',
  'SearchModalUtilService',
];

function RequiredInventoryScansSearchModalController(data, util, Store, Instance, Stock, SearchModal) {
  const vm = this;
  const changes = new Store({ identifier : 'key' });

  vm.filters = data;
  vm.searchQueries = {};
  vm.defaultQueries = {};

  const searchQueryOptions = [
    'depot_uuid',
  ];

  // displayValues will be an id:displayValue pair
  const displayValues = {};
  const lastDisplayValues = Stock.filter.lot.getDisplayValueMap();

  // assign already defined custom filters to searchQueries object
  vm.searchQueries = util.maskObjectFromKeys(data, searchQueryOptions);

  // custom filter depot_uuid - assign the value to the params object
  vm.onSelectDepot = function onSelectDepot(depot) {
    vm.searchQueries.depot_uuid = depot.uuid;
    displayValues.depot_uuid = depot.text;
  };

  // default filter limit - directly write to changes list
  vm.onSelectLimit = function onSelectLimit(value) {
    // input is type value, this will only be defined for a valid number
    if (angular.isDefined(value)) {
      changes.post({ key : 'limit', value });
    }
  };

  // deletes a filter from the custom filter object,
  // this key will no longer be written to changes on exit
  vm.clear = function clear(key) {
    delete vm.searchQueries[key];
  };

  if (data.limit) {
    vm.defaultQueries.limit = data.limit;
  }

  if (data.tags) {
    vm.defaultQueries.tags = data.tags.map(t => t.name).join(',');
  }

  vm.cancel = () => Instance.dismiss();

  vm.submit = () => {

    const loggedChanges = SearchModal.getChanges(vm.searchQueries, changes, displayValues, lastDisplayValues);

    return Instance.close(loggedChanges);
  };
}
