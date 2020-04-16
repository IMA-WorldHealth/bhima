angular.module('bhima.controllers')
  .controller('UsersCashBoxManagementController', UsersCashBoxManagementController);

UsersCashBoxManagementController.$inject = [
  '$state', 'UserService', 'NotifyService', 'appcache', 'CashboxService', '$q',
];

function UsersCashBoxManagementController($state, Users, Notify, AppCache, Cashboxes, $q) {
  const vm = this;
  const cache = AppCache('UserCashbox');

  if ($state.params.id) {
    cache.stateParams = $state.params;
    vm.stateParams = cache.stateParams;
  } else {
    vm.stateParams = cache.stateParams;
  }

  vm.loading = true;

  // the user object that is either edited or created
  vm.user = {};

  vm.onToggleAllChecked = (isChecked) => {
    vm.cashboxes.forEach(cashbox => {
      cashbox.checked = isChecked;
    });
  };

  vm.onToggleCheckbox = () => {
    vm.isAllChecked = vm.cashboxes.every(box => box.checked);
  };

  // exposed methods
  vm.submit = submit;

  // submit the data to the server from all two forms (update, create)
  function submit(userForm) {
    if (userForm.$invalid || !vm.user.id) { return null; }

    const cashboxes = vm.cashboxes
      .filter(cashbox => cashbox.checked)
      .map(cashbox => cashbox.id);

    return Users.cashBoxManagement(vm.user.id, cashboxes)
      .then(() => {
        Notify.success('USERS.UPDATED');
        $state.go('users.list');
      })
      .catch(Notify.handleError);
  }

  function startup() {
    const promises = $q.all([
      Cashboxes.read(),
      Users.cashboxes(vm.stateParams.id),
      Users.read(vm.stateParams.id),
    ]);


    return promises
      .then(([cashboxes, selected, user]) => {
        vm.cashboxes = cashboxes;
        vm.cashboxes.forEach(cashbox => {
          cashbox.checked = selected.includes(cashbox.id);
        });

        vm.isAllChecked = vm.cashboxes.every(cashbox => cashbox.checked);

        vm.user = user;
      })
      .catch(Notify.handleError)
      .finally(() => {
        vm.loading = false;
      });
  }

  startup();
}
