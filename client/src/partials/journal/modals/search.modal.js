angular.module('bhima.controllers')
  .controller('JournalSearchModalController', JournalSearchModalController);

JournalSearchModalController.$inject = [
  '$uibModalInstance', 'AccountService', 'UserService', 'ProjectService', 'NotifyService', 'options'
];

function JournalSearchModalController(Instance, Accounts, Users, Projects, Notify, options) {
  var vm = this;

  vm.options = options || {};

  Accounts.read()
    .then(function (accounts) {
      vm.accounts = accounts;
    })
    .catch(Notify.handleError);

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

    // loop through and remove empty values from the json options
    var keys = Object.keys(vm.options);
    keys.forEach(function (key) {
      var prop = vm.options[key];
      if (!angular.isDefined(prop) || prop === '') { delete vm.options[key]; }
    });

    // return values to the JournalController
    return Instance.close(vm.options);
  };
}
