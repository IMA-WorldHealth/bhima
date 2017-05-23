angular.module('bhima.controllers')
  .controller('JournalSearchModalController', JournalSearchModalController);

JournalSearchModalController.$inject = [
  '$uibModalInstance', 'ProjectService', 'NotifyService',
  'Store', 'filters', 'options', 'PeriodService', 'VoucherService', '$translate',
];

function JournalSearchModalController(Instance, Projects, Notify,
  Store, filters, options, Periods, Vouchers, $translate) {
  var vm = this;

  var changes = new Store({ identifier : 'key' });
  vm.filters = filters;

  // an object to keep track of all custom filters, assigned in the view
  vm.searchQueries = {};
  vm.defaultQueries = {};

  // @TODO ideally these should be passed in when the modal is initialised
  //       these are known when the filter service is defined
  var searchQueryOptions = [
    'description', 'user_id', 'account_id', 'project_id', 'amount', 'trans_id', 'origin_id',
  ];

  // assign already defined custom filters to searchQuery object
  // @TODO write this as a commonly used utility
  vm.searchQueries = Object.keys(filters).reduce(function (aggregate, filterKey) {
    // this object is only for custom search querries
    if (searchQueryOptions.indexOf(filterKey) >= 0) {
      aggregate[filterKey] = filters[filterKey];
    }
    return aggregate;
  }, {});

  // has default account
  if (options.hasDefaultAccount) {
    vm.hasDefaultAccount = true;
  }

  // assign default filters
  if (filters.limit) {
    vm.defaultQueries.limit = filters.limit;
  }

  // assing default account
  if (filters.account_id) {
    vm.defaultQueries.account_id = filters.account_id;
  }

  Projects.read()
    .then(function (projects) {
      vm.projects = projects;
    })
    .catch(Notify.handleError);

  // format voucher types and bind to the view
  Vouchers.transactionType()
    .then(function (list) {
      vm.types = list.data.map(function (item) {
        item.hrText = $translate.instant(item.text);
        return item;
      });
    })
    .catch(Notify.handleError);

  // handle component selection states
  // custom filter account_id - assign the value to the searchQueries object
  vm.onSelectAccount = function onSelectAccount(account) {
    changes.post({ key : 'account_id', value : account.id, displayValue : account.label });
  };

  // custom filter user_id - assign the value to the searchQueries object
  vm.onSelectUser = function onSelectUser(user) {
    vm.searchQueries.user_id = user.id;
  };

  // deafult filter period - directly write to changes list
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
    if (vm.defaultQueries[key]) {
      delete vm.defaultQueries[key];
      delete filters[key];
    }
    delete vm.searchQueries[key];
  };

  vm.cancel = Instance.dismiss;

  // returns the filters to the journal to be used to refresh the page
  vm.submit = function submit(form) {
    // push all searchQuery values into the changes array to be applied
    angular.forEach(vm.searchQueries, function (value, key) {
      if (angular.isDefined(value)) {
        changes.post({ key : key, value : value });
      }
    });

    var loggedChanges = changes.getAll();

    // return values to the JournalController
    return Instance.close(loggedChanges);
  };
}
