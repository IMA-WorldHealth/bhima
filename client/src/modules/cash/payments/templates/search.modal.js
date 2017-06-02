angular.module('bhima.controllers')
  .controller('SearchCashPaymentModalController', SearchCashPaymentModalController);

SearchCashPaymentModalController.$inject = [
  'CashboxService', 'NotifyService', '$uibModalInstance', 'filters', 'Store', 'PeriodService', 'util', 'DebtorGroupService',
];

/**
 * Search Cash Payment controller
 *
 * @description
 * This controller powers the Invoice Search modal.  Invoices are passed in from the registry as
 * POJO and are attached to the view.  They are modified here and returned to the parent controller
 * as a POJO.
 */
function SearchCashPaymentModalController(Cashboxes, Notify, Instance, filters, Store, Periods, util, DebtorGroups) {
  var vm = this;
  var changes = new Store({ identifier : 'key' });
  vm.filters = filters;

  vm.searchQueries = {};
  vm.defaultQueries = {};

  // @TODO ideally these should be passed in when the modal is initialised
  //       these are known when the filter service is defined
  var searchQueryOptions = [
    'is_caution', 'reference', 'cashbox_id', 'user_id', 'reference_patient', 'currency_id', 'reversed',
  ];

  // assign already defined custom filters to searchQueries object
  vm.searchQueries = util.maskObjectFromKeys(filters, searchQueryOptions);

  // assign default filters
  if (filters.limit) {
    vm.defaultQueries.limit = filters.limit;
  }

  vm.cancel = Instance.close;

  // cashboxes
  Cashboxes.read()
    .then(function (list) {
      vm.cashboxes = list;
    })
    .catch(Notify.handleError);

  DebtorGroups.read()
    .then(function (result) {
      vm.debtorGroups = result;
    });

  // custom filter user_id - assign the value to the searchQueries object
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

  // returns the filters to the journal to be used to refresh the page
  vm.submit = function submit() {
    // push all searchQuery values into the changes array to be applied
    angular.forEach(vm.searchQueries, function (value, key) {
      if (angular.isDefined(value)) {
        changes.post({ key : key, value : value });
      }
    });

    var loggedChanges = changes.getAll();

    // return values to the CashController
    return Instance.close(loggedChanges);
  };
}
