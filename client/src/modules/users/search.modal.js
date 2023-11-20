angular.module('bhima.controllers')
  .controller('UserRegistryModalController', UserRegistryModalController);

UserRegistryModalController.$inject = [
  '$uibModalInstance', 'filters', 'Store', 'util', 'PeriodService', 'UserService',
  'SearchModalUtilService',
];

/**
 * @class UserRegistryModalController
 *
 * @description
 * This controller is responsible for setting up the filters for the user
 * search functionality on the user registry page.  Filters that are already
 * applied to the grid can be passed in via the filters inject.
 */
function UserRegistryModalController(ModalInstance, filters, Store, util, Periods, Users, SearchModal) {
  const vm = this;
  const changes = new Store({ identifier : 'key' });

  // displayValues will be an id:displayValue pair
  const displayValues = {};

  const searchQueryOptions = [
    'display_name', 'depot_uuid',
  ];

  vm.filters = filters;

  vm.today = new Date();
  vm.defaultQueries = {};
  vm.searchQueries = {};

  // assign default limit filter
  if (filters.limit) {
    vm.defaultQueries.limit = filters.limit;
  }

  const lastDisplayValues = Users.filters.getDisplayValueMap();

  // assign already defined custom filters to searchQueries object
  vm.searchQueries = util.maskObjectFromKeys(filters, searchQueryOptions);

  // bind methods
  vm.submit = submit;
  vm.cancel = cancel;
  vm.clear = clear;

  // default filter limit - directly write to changes list
  vm.onSelectLimit = function onSelectLimit(val) {
    // input is type value, this will only be defined for a valid number
    if (angular.isDefined(val)) {
      changes.post({ key : 'limit', value : val });
    }
  };

  // default filter period - directly write to changes list
  vm.onSelectPeriod = function onSelectPeriod(period) {
    const periodFilters = Periods.processFilterChanges(period);

    periodFilters.forEach((filterChange) => {
      changes.post(filterChange);
    });
  };

  // custom filter depot_uuid - assign the value to the params object
  vm.onSelectDepot = function onSelectDepot(depot) {
    vm.searchQueries.depot_uuid = depot.uuid;
    displayValues.depot_uuid = depot.text;
  };

  // returns the parameters to the parent controller
  function submit() {
    const loggedChanges = SearchModal.getChanges(vm.searchQueries, changes, displayValues, lastDisplayValues);
    return ModalInstance.close(loggedChanges);
  }

  function clear(value) {
    delete vm.searchQueries[value];
  }

  // dismiss the modal
  function cancel() {
    ModalInstance.close();
  }
}
