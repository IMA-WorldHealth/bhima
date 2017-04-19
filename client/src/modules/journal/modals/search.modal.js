angular.module('bhima.controllers')
  .controller('JournalSearchModalController', JournalSearchModalController);

JournalSearchModalController.$inject = [
  '$uibModalInstance', 'UserService', 'ProjectService', 'NotifyService', 'options', 'VoucherService', '$translate'
];

function JournalSearchModalController(Instance, Users, Projects, Notify, options, Vouchers, $translate) {
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

  // format voucher types and bind to the view
  Vouchers.transactionType()
    .then(function (list) {
      // make sure that the items are translated
      list.data.forEach(function (item) {
        item.hrText = $translate.instant(item.text);
      });

      // bind to the view
      vm.types = list.data;
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
    // return values to the JournalController
    return Instance.close(vm.options);
  };
}
