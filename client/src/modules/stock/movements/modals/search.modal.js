angular.module('bhima.controllers')
  .controller('SearchMovementsModalController', SearchMovementsModalController);

SearchMovementsModalController.$inject = [
  'data', 'NotifyService', '$uibModalInstance', 'FluxService',
  '$translate', 'PeriodService', 'Store', 'util', 'StockService',
];

function SearchMovementsModalController(data, Notify, Instance, Flux, $translate, Periods, Store, util, Stock) {
  var vm = this;
  var changes = new Store({ identifier : 'key' });

  var searchQueryOptions = [
    'is_exit', 'depot_uuid', 'inventory_uuid', 'label', 'flux_id', 'dateFrom', 'dateTo',
  ];

  vm.filters = data;

  vm.searchQueries = {};
  vm.defaultQueries = {};

  // displayValues will be an id:displayValue pair
  var displayValues = {};  

  // load flux
  Flux.read()
    .then(function (rows) {
      vm.fluxes = rows.map(function (row) {
        row.label = $translate.instant(row.label);
        return row;
      });
    })
    .catch(Notify.handleError);

  // default filter period - directly write to changes list
  vm.onSelectPeriod = function onSelectPeriod(period) {
    var periodFilters = Periods.processFilterChanges(period);

    periodFilters.forEach(function (filterChange) {
      changes.post(filterChange);
    });
  };

  var lastViewFilters = Stock.filter.movement.formatView().customFilters;

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

  // custom filter flux_id - assign the value to the searchQueries object
  vm.onFluxChange = function onFluxChange(flux) {
    vm.searchQueries.flux_id = flux;
    var typeText = '/';

    flux.forEach(function (fluxId) {
      vm.fluxes.forEach(function (flux) {
        if (fluxId === flux.id) {
          typeText += flux.label + ' / ';
        }
      });
    });

    displayValues.flux_id = typeText;
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
      changes.post({ key : 'limit', value : value });
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
