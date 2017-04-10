angular.module('bhima.controllers')
  .controller('JournalSearchModalController', JournalSearchModalController);

JournalSearchModalController.$inject = [
  '$uibModalInstance', 'UserService', 'ProjectService', 'NotifyService', 'options'
];

function JournalSearchModalController(Instance, Users, Projects, Notify, options) {
  var vm = this;

  vm.options = options || {};

  // set up this module's default qurries
  vm.options.defaults = {};
  vm.options.custom = {};
  // object for tracking additional filter queries


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
  vm.onSelectPeriod = function onSelectPeriod(key) {
    console.log('controller on select called with', key);
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
    if (form.$invalid) { return; }

    // @TODO decide if modal should be responsible for defining actual filters or
    // should just return options object for controller to sort into Filters
    console.log('submitting with options', vm.options);

    // return values to the JournalController
    // return Instance.close(vm.options);
  };
}
