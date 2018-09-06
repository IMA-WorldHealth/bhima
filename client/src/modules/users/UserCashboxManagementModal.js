angular.module('bhima.controllers')
  .controller('UsersCashBoxManagementController', UsersCashBoxManagementController);

UsersCashBoxManagementController.$inject = [
  '$state', 'UserService', 'NotifyService', 'appcache',
];

function UsersCashBoxManagementController($state, Users, Notify, AppCache) {
  const vm = this;
  const cache = AppCache('UserCashbox');

  if ($state.params.id) {
    cache.stateParams = $state.params;
    vm.stateParams = cache.stateParams;
  } else {
    vm.stateParams = cache.stateParams;
  }

  // the user object that is either edited or created
  vm.user = {};
  vm.initialUserCashboxes = [];

  // exposed methods
  vm.submit = submit;
  vm.closeModal = closeModal;

  vm.onCashBoxChange = function onCashBoxChange(cashboxes) {
    vm.user.cashboxes = cashboxes;
  };

  // submit the data to the server from all two forms (update, create)
  function submit(userForm) {
    if (userForm.$invalid || !vm.user.id) { return null; }

    return Users.cashBoxManagement(vm.user.id, vm.user.cashboxes)
      .then(() => {
        Notify.success('USERS.UPDATED');
        $state.go('users.list');
      })
      .catch(Notify.handleError);
  }

  Users.cashboxes(vm.stateParams.id)
    .then((cashboxes) => {
      vm.initialUserCashboxes = cashboxes;
      return Users.read(vm.stateParams.id);
    })
    .then((user) => {
      vm.user = user;

      // manually update the model as the bh-multiple-cashbox-select seems to ignore
      // the first data update
      vm.onCashBoxChange(vm.initialUserCashboxes);
    })
    .catch(Notify.handleError);

  function closeModal() {
    $state.go('users.list');
  }

}
