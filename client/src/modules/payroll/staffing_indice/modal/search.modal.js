angular.module('bhima.controllers')
  .controller('StaffingSearchModalController', StaffingSearchModalController);

StaffingSearchModalController.$inject = [
  '$uibModalInstance', 'NotifyService', 'Store', 'filters', 'options',
  '$translate', 'util', 'StaffingIndiceService', 'PeriodService',
];

function StaffingSearchModalController(
  Instance, Notify, Store, filters, options, $translate, util, Journal, Periods
) {
  const vm = this;

  // displayValues will be an id:displayValue pair
  const displayValues = {};
  const lastDisplayValues = Journal.filters.getDisplayValueMap();

  // @TODO ideally these should be passed in when the modal is initialised
  //       these are known when the filter service is defined
  const searchQueryOptions = ['employee_uuid', 'created_at'];

  const changes = new Store({ identifier : 'key' });
  vm.filters = filters;
  vm.options = options;

  vm.max_date = new Date();
  // an object to keep track of all custom filters, assigned in the view
  vm.searchQueries = {};
  vm.defaultQueries = {};
  // assign already defined custom filters to searchQueries object
  vm.searchQueries = util.maskObjectFromKeys(filters, searchQueryOptions);

  vm.onSelectEmployee = (employee) => {
    vm.searchQueries.employee_uuid = employee.uuid;
    displayValues.employee_uuid = employee.display_name;
  };

  if (vm.searchQueries.created_at) {
    vm.searchQueries.created_at = new Date(vm.searchQueries.created_at);
    displayValues.created_at = util.formatDate(vm.searchQueries.created_at, 'DD/MM/YYYY');
  }

  vm.onDateChange = (date) => {
    vm.searchQueries.created_at = date;
    displayValues.created_at = util.formatDate(date, 'DD/MM/YYYY');
  };

  // deafult filter period - directly write to changes list
  vm.onSelectPeriod = function onSelectPeriod(period) {
    const periodFilters = Periods.processFilterChanges(period);

    periodFilters.forEach(filterChange => {
      changes.post(filterChange);
    });
  };

  // assign default filters
  if (filters.limit) {
    vm.defaultQueries.limit = filters.limit;
  }

  if (angular.isDefined(filters.showFullTransactions)) {
    vm.defaultQueries.showFullTransactions = filters.showFullTransactions;
  }

  // assign default account
  if (filters.account_id) {
    vm.defaultQueries.account_id = filters.account_id;
  }


  // default filter limit - directly write to changes list
  vm.onSelectLimit = function onSelectLimit(value) {
    // input is type value, this will only be defined for a valid number
    if (angular.isDefined(value)) {
      changes.post({ key : 'limit', value });
    }
  };

  // deletes a filter from the custom filter object, this key will no longer be written to changes on exit
  vm.clear = function clear(key) {
    delete vm.searchQueries[key];
  };

  vm.cancel = Instance.dismiss;

  // returns the filters to the journal to be used to refresh the page
  vm.submit = function submit(form) {
    if (form.$invalid) { return 0; }
    // push all searchQuery values into the changes array to be applied
    angular.forEach(vm.searchQueries, (value, key) => {
      if (angular.isDefined(value)) {
        // default to the original value if no display value is defined
        const displayValue = displayValues[key] || lastDisplayValues[key] || value;
        changes.post({ key, value, displayValue });
      }
    });

    const loggedChanges = changes.getAll();

    // return values to the JournalController
    return Instance.close(loggedChanges);
  };
}
