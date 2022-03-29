angular.module('bhima.controllers')
  .controller('AssetScansSearchModalController', AssetScansSearchModalController);

// dependencies injections
AssetScansSearchModalController.$inject = [
  'data', 'util', 'Store', '$uibModalInstance', 'StockService',
  'SearchModalUtilService', 'PeriodService',
];

function AssetScansSearchModalController(data, util, Store, Instance, Stock, SearchModal, Periods) {
  const vm = this;
  const changes = new Store({ identifier : 'key' });

  vm.filters = data;
  vm.searchQueries = {};
  vm.defaultQueries = {};

  const searchQueryOptions = [
    'depot_uuid', 'inventory_uuid', 'group_uuid', 'asset_label',
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

  // custom filter inventory_uuid - assign the value to the params object
  vm.onSelectInventory = function onSelectInventory(inventory) {
    vm.searchQueries.inventory_uuid = inventory.uuid;
    displayValues.inventory_uuid = inventory.label;
  };

  // custom filter group_uuid - assign the value to the params object
  vm.onSelectGroup = (group) => {
    vm.searchQueries.group_uuid = group.uuid;
    displayValues.group_uuid = group.name;
  };

  // default filter limit - directly write to changes list
  vm.onSelectLimit = function onSelectLimit(value) {
    // input is type value, this will only be defined for a valid number
    if (angular.isDefined(value)) {
      changes.post({ key : 'limit', value });
    }
  };

  // default filter period - directly write to changes list
  vm.onSelectPeriod = function onSelectPeriod(period) {
    const periodFilters = Periods.processFilterChanges(period);

    periodFilters.forEach((filterChange) => {
      changes.post(filterChange);
    });
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
