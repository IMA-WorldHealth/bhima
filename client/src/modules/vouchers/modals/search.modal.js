angular.module('bhima.controllers')
  .controller('VoucherRegistrySearchModalController', VoucherRegistrySearchModalController);

VoucherRegistrySearchModalController.$inject = [
  '$uibModalInstance', 'filters', 'NotifyService', 'moment', 'bhConstants', 'PeriodService', 'Store', 'util'
];

/**
 * @class VoucherRegistrySearchModalController
 *
 * @description
 * This controller is responsible to collecting data from the search form and
 * returning it as a JSON object to the parent controller.  The data can be
 * preset by passing in a filters object using filtersProvider().
 */
function VoucherRegistrySearchModalController(ModalInstance, filters, Notify, moment, bhConstants, Periods, Store, util) {
  var vm = this;
  var changes = new Store({identifier : 'key'});
  vm.filters = filters;
  vm.searchQueries = {};
  vm.defaultQueries = {};

  var searchQueryOptions = [
    'reference', 'description', 'user_id',
  ];

  // assign already defined custom filters to searchQueries object
  vm.searchQueries = util.maskObjectFromKeys(filters, searchQueryOptions);

  if(filters.limit){
    vm.defaultQueries.limit = filters.limit;
  }

  // custom filter user_id - assign the value to the params object
  vm.onSelectUser = function onSelectUser(user) {
    vm.searchQueries.user_id = user.id;
  };

  // default filter period - directly write to changes list
  vm.onSelectPeriod = function onSelectPeriod(period) {
    var periodFilters = Periods.processFilterChanges(period);

    periodFilters.forEach(function (filterChange) {
      changes.post(filterChange);
    });
  };

  // default filter limit - directly write to changes list
  vm.onSelectLimit = function onSelectLimit(value) {
    // input is type value, this will only be defined for a valid number
    if (angular.isDefined(value)) {
      changes.post({ key : 'limit', value : value });
    }
  };

  // deletes a filter from the custom filter object, this key will no longer be written to changes on exit
  vm.clear = function clear(key) {
    delete vm.searchQueries[key];
  };

  vm.cancel = function cancel() { ModalInstance.close(); };

  // submit the filter object to the parent controller.
  vm.submit = function submit(form) {

    // push all searchQuery values into the changes array to be applied
    angular.forEach(vm.searchQueries, function (value, key) {
      if (angular.isDefined(value)) {
        changes.post({ key : key, value : value });
      }
    });

    var loggedChanges = changes.getAll();

    // return values to the voucher controller
    return ModalInstance.close(loggedChanges);
  }
}
