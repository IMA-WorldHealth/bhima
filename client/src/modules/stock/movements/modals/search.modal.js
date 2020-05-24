angular.module('bhima.controllers')
  .controller('SearchMovementsModalController', SearchMovementsModalController);

SearchMovementsModalController.$inject = [
  'data', 'NotifyService', '$uibModalInstance',
  'PeriodService', 'Store', 'util', 'StockService',
];

function SearchMovementsModalController(data, Notify, Instance, Periods, Store, util, Stock) {
  const vm = this;
  const displayValues = {};
  const changes = new Store({ identifier : 'key' });

  const searchQueryOptions = [
    'is_exit', 'depot_uuid', 'inventory_uuid', 'label', 'flux_id', 'dateFrom', 'dateTo', 'user_id',
    'patientReference', 'service_uuid', 'invoice_uuid',
  ];

  vm.filters = data;

  vm.searchQueries = {};
  vm.defaultQueries = {};

  // keep track of the initial search queries to make sure we properly restore
  // default display values
  const initialSearchQueries = angular.copy(vm.searchQueries);

  // default filter period - directly write to changes list
  vm.onSelectPeriod = function onSelectPeriod(period) {
    const periodFilters = Periods.processFilterChanges(period);

    periodFilters.forEach(filterChange => {
      changes.post(filterChange);
    });
  };

  // map key to last display value for lookup in loggedChange
  const lastDisplayValues = Stock.filter.movement.getDisplayValueMap();

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

  // Custom filter service_id - assign the value to the params object
  vm.onSelectService = service => {
    vm.searchQueries.service_uuid = service.uuid;
    displayValues.service_uuid = service.name;
  };

  // custom filter flux_id - assign the value to the searchQueries object
  vm.onFluxChange = function onFluxChange(fluxes) {
    const searchValue = fluxes.map(f => f.id);

    // concats with a comma, replaces last comma
    const displayValue = fluxes
      .reduce((aggstr, flux) => aggstr.concat(flux.plainText, ', '), '')
      .replace(/, $/i, '')
      .trim();

    vm.searchQueries.flux_id = searchValue;
    displayValues.flux_id = displayValue;
  };

  // custom filter user
  vm.onSelectUser = function onSelectUser(user) {
    vm.searchQueries.user_id = user.id;
    displayValues.user_id = user.display_name;
  };

  // assign already defined custom filters to searchQueries object
  vm.searchQueries = util.maskObjectFromKeys(data, searchQueryOptions);

  if (data.limit) {
    vm.defaultQueries.limit = data.limit;
  } else {
    vm.defaultQueries.limit = 100;
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
