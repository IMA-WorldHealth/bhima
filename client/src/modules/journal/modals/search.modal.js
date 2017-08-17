angular.module('bhima.controllers')
  .controller('JournalSearchModalController', JournalSearchModalController);

JournalSearchModalController.$inject = [
  '$uibModalInstance', 'ProjectService', 'NotifyService',
  'Store', 'filters', 'options', 'PeriodService', 'VoucherService', '$translate',
  'AccountService', 'util',
];

function JournalSearchModalController(Instance, Projects, Notify,
  Store, filters, options, Periods, Vouchers, $translate,
  Account, util) {
  var vm = this;

  var changes = new Store({ identifier : 'key' });
  vm.filters = filters;
  vm.options = options;

  // an object to keep track of all custom filters, assigned in the view
  vm.searchQueries = {};
  vm.defaultQueries = {};

  // @TODO ideally these should be passed in when the modal is initialised
  //       these are known when the filter service is defined
  var searchQueryOptions = ['description', 'user_id', 'account_id', 'project_id', 'amount', 'trans_id', 'origin_id', 'includeNonPosted'];

  // assign already defined custom filters to searchQueries object
  vm.searchQueries = util.maskObjectFromKeys(filters, searchQueryOptions);

  window.search = vm.searchQueries;

  /**
   * hasDefaultAccount is used to set a default account selection behavior
   * if the search modal need to set account selection in default query panel we can send it
   * as parameters
   * @example
   * <pre>
   * Config.openSearchModal(filters, { hasDefaultAccount : true })
   * </pre>
   */
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

  Account.read()
    .then(function (accounts) {
      vm.hrAccounts = accounts.reduce(function (aggregate, account) {
        aggregate[account.id] = String(account.number).concat(' - ', account.label);
        return aggregate;
      }, {});
    })
    .catch(Notify.handleError);

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
    vm.searchQueries.account_id = account.id;
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
    delete vm.searchQueries[key];
  };

  vm.cancel = Instance.dismiss;

  // returns the filters to the journal to be used to refresh the page
  vm.submit = function submit(form) {
    // push all searchQuery values into the changes array to be applied
    angular.forEach(vm.searchQueries, function (value, key) {
      if (angular.isDefined(value)) {
        if (key === 'account_id') {
          changes.post({ key : key, value : value, displayValue : vm.hrAccounts[value] });
        } else {
          changes.post({ key : key, value : value });
        }
      }
    });

    var loggedChanges = changes.getAll();

    // return values to the JournalController
    return Instance.close(loggedChanges);
  };
}
