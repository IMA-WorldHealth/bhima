angular.module('bhima.controllers')
  .controller('SearchAssetsModalController', SearchAssetsModalController);

// dependencies injections
SearchAssetsModalController.$inject = [
  'data', 'util', 'Store', '$uibModalInstance', 'PeriodService', 'StockService',
  'SearchModalUtilService',
];

function SearchAssetsModalController(data, util, Store, Instance, Periods, Stock, SearchModal) {
  const vm = this;
  const changes = new Store({ identifier : 'key' });

  vm.filters = data;
  vm.searchQueries = {};
  vm.defaultQueries = {};

  const searchQueryOptions = [
    'depot_uuid', 'inventory_uuid', 'group_uuid', 'label',
    'entry_date_from', 'entry_date_to', 'tags',
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

  // Save the entry dates
  vm.onEntryDate = (dateFrom, dateTo) => {
    vm.searchQueries.entry_date_from = dateFrom;
    displayValues.entry_date_from = dateFrom;
    vm.searchQueries.entry_date_to = dateTo;
    displayValues.entry_date_to = dateTo;
  };

  // Save the Tags
  vm.onSelectTags = tags => {
    vm.searchQueries.tags = tags;
    displayValues.tags = tags.map(t => t.name).join(',');
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

    // The following work-around is necessary to deal with the case where you
    // select a tag but then delete it before clicking [Submit]; the element
    // has an empty array so it needs to be deleted. There probably is a
    // cleaner way to do this.
    loggedChanges.some((elt, i) => {
      if (elt.key === 'tags') {
        if (elt.value.length === 0) {
          delete loggedChanges[i];
        }
      }
      return elt.key === 'tags';
    });

    return Instance.close(loggedChanges);
  };
}
