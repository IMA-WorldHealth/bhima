angular.module('bhima.controllers')
  .controller('JournalSearchModalController', JournalSearchModalController);

JournalSearchModalController.$inject = [
  '$uibModalInstance', 'UserService', 'ProjectService', 'NotifyService', 'options'
];

function JournalSearchModalController(Instance, Users, Projects, Notify, options) {
  var vm = this;

  vm.options = options || {};

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

    // return values to the JournalController
    return Instance.close(vm.options);
  };
}
