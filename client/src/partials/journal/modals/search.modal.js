angular.module('bhima.controllers')
  .controller('JournalSearchModalController', JournalSearchModalController);

JournalSearchModalController.$inject = [
  '$uibModalInstance', 'UserService', 'ProjectService', 'NotifyService', 'Store', 'options', 'PeriodService'
];

function JournalSearchModalController(Instance, Users, Projects, Notify, Store, options, Periods) {
  var vm = this;

  var changes = new Store({ identifier : 'key' });

  var filters = options;

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
    vm.options.account_id = account.id;
  };


  // ONLY the period key will be cached and sent to the server (unless there are custom dates)
  // this module should also send a `client_timestamp` so that the server's calculations
  // can be based on the client - this was the client does not need to calculate the periods
  // unless they are being updated
  vm.onSelectPeriod = function onSelectPeriod(period) {
    var periodFilters = Periods.processFilterChanges(period);

    periodFilters.forEach(function (filterChange) {
      changes.post(filterChange);
    });
  };

  // deletes a filter from the options/parameters
  vm.clear = function clear(key) {
    delete vm.options[key];
  };

  vm.cancel = function cancel() {
    Instance.dismiss();
  };

  // returns the filters to the journal to be used to refresh the page
  vm.submit = function submit(form) {
    // if (form.$invalid) { return; }


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
