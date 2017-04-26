angular.module('bhima.controllers')
  .controller('JournalSearchModalController', JournalSearchModalController);

JournalSearchModalController.$inject = [
  '$uibModalInstance', 'UserService', 'ProjectService', 'NotifyService', 'Store', 'options', 'PeriodService'
];

function JournalSearchModalController(Instance, Users, Projects, Notify, Store, options, Periods) {
  var vm = this;

  var changes = new Store({ identifier : 'key' });

  var filters = options;

  console.log('filters', filters, Object.keys(filters));
  // an object to keep track of all custom filters, assigned in the view
  vm.searchQueries = {};
  vm.defaultQueries = {};

  // hack
  var queryOptions = [ 'description', 'user_id', 'account_id', 'project_id', 'amount', 'trans_id' ];

  // assign current custom filters to searchQuery object
  // @TODO write this as a commonly used utility
  vm.searchQueries = Object.keys(filters).reduce(function (aggregate, filterKey) {
    // this object is only for custom search querries
    if (queryOptions.indexOf(filterKey) >= 0) {
      aggregate[filterKey] = filters[filterKey];
    }
    return aggregate;
  }, {});

  // assign default filters
  if (filters.limit) {
    vm.defaultQueries.limit = filters.limit;
  }

  // return an array of changes to be made, this will be applied by the controller
  // this should be well unit tested
  vm.filters = filters;

  console.log('got filters', filters);

  Users.read()
    .then(function (users) {
      vm.users = users;
    })
    .catch(Notify.handleError);

  Projects.read()
    .then(function (projects) {
      vm.projects = projects;
    })
    .catch(Notify.handleError);

  vm.onSelectAccount = function onSelectAccount(account) {
    vm.searchQueries.account_id = account.id;
  };

  window.clearmate = vm.onSelectAccount;

  // ONLY the period key will be cached and sent to the server (unless there are custom dates)
  // this module should also send a `client_timestamp` so that the server's calculations
  // can be based on the client - this was the client does not need to calculate the periods
  // unless they are being updated
  vm.onSelectPeriod = function onSelectPeriod(period) {
    var periodFilters = Periods.processFilterChanges(period);

    console.log('got period changes', periodFilters);
    periodFilters.forEach(function (filterChange) {
      changes.post(filterChange);
    });
  };

  vm.onSelectLimit = function onSelectLimit(value) {
    console.log('limit changed', value);

    // input is type value, this will only be defined for a valid number
    // @TODO further validation
    if (angular.isDefined(value)) {
      changes.post({ key : 'limit', value : value });
    }
  };

  // deletes a filter from the options/parameters
  vm.clear = function clear(key) {
    delete vm.searchQueries[key];
  };

  vm.cancel = Instance.dismiss;

  // returns the filters to the journal to be used to refresh the page
  vm.submit = function submit(form) {
    // if (form.$invalid) { return; }

    console.log('search queries', vm.searchQueries);
    // push all searchQuery values into the changes array to be applied
    angular.forEach(vm.searchQueries, function (value, key) {
      if (angular.isDefined(value)) {
        changes.post({ key : key, value : value });
      }
    });

    console.log('processed changes', form);
    // @TODO decide if modal should be responsible for defining actual filters or
    // should just return options object for controller to sort into Filters
    console.log('changes', changes.getAll());

    // @TODO parse form for changes - push into changes with correct format
    var loggedChanges = changes.getAll();
    // return values to the JournalController
    // return Instance.close(vm.options);
    return Instance.close(loggedChanges);
  };
}
