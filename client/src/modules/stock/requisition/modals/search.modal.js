angular.module('bhima.controllers')
  .controller('SearchStockRequisitionModalController', SearchStockRequisitionModalController);

// dependencies injections
SearchStockRequisitionModalController.$inject = [
  'data', 'util', 'Store', '$uibModalInstance', 'PeriodService', 'StockService',
];

function SearchStockRequisitionModalController(data, util, Store, Instance, Periods, Stock) {
  const vm = this;
  const changes = new Store({ identifier : 'key' });

  vm.filters = data;
  vm.searchQueries = {};
  vm.defaultQueries = {};

  const searchQueryOptions = [
    'depot_uuid', 'date_from', 'date_to',
  ];

  const displayValues = {};
  const lastDisplayValues = Stock.filter.requisition.getDisplayValueMap();
  const initialSearchQueries = angular.copy(vm.searchQueries);

  vm.onSelectPeriod = function onSelectPeriod(period) {
    const periodFilters = Periods.processFilterChanges(period);
    periodFilters.forEach(filterChange => {
      changes.post(filterChange);
    });
  };

  vm.onSelectDepot = function onSelectDepot(depot) {
    vm.searchQueries.depot_uuid = depot.uuid;
    displayValues.depot_uuid = depot.text;
  };

  vm.onSelectRequestor = requestor => {
    vm.searchQueries.requestor_uuid = requestor.uuid;
    displayValues.requestor_uuid = requestor.name || requestor.text;
  };

  vm.searchQueries = util.maskObjectFromKeys(data, searchQueryOptions);

  if (data.limit) {
    vm.defaultQueries.limit = data.limit;
  }

  vm.onSelectLimit = function onSelectLimit(value) {
    if (angular.isDefined(value)) {
      changes.post({ key : 'limit', value });
    }
  };

  vm.clear = function clear(key) {
    delete vm.searchQueries[key];
  };

  vm.cancel = Instance.dismiss;

  vm.submit = function submit() {
    angular.forEach(vm.searchQueries, (value, key) => {
      if (angular.isDefined(value)) {
        const usePreviousDisplayValue = angular.equals(initialSearchQueries[key], value)
          && angular.isDefined(lastDisplayValues[key]);
        const displayValue = usePreviousDisplayValue
          ? lastDisplayValues[key] : displayValues[key] || value;
        changes.post({ key, value, displayValue });
      }
    });

    const loggedChanges = changes.getAll();
    return Instance.close(loggedChanges);
  };
}
