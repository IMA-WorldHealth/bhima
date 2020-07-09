angular.module('bhima.controllers')
  .controller('SearchStockRequisitionModalController', SearchStockRequisitionModalController);

// dependencies injections
SearchStockRequisitionModalController.$inject = [
  'data', 'util', 'Store', '$uibModalInstance', 'PeriodService', 'StockService',
  'SearchModalUtilService',
];

function SearchStockRequisitionModalController(data, util, Store, Instance, Periods, Stock, SearchModal) {
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
    const loggedChanges = SearchModal.getChanges(vm.searchQueries, changes, displayValues, lastDisplayValues);
    return Instance.close(loggedChanges);
  };
}
