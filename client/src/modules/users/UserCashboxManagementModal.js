angular.module('bhima.controllers')
  .controller('UsersCashBoxManagementController', UsersCashBoxManagementController);

UsersCashBoxManagementController.$inject = [
  '$state', 'UserService',
  'NotifyService', 'appcache',
];

function UsersCashBoxManagementController($state, Users, Notify, AppCache) {
  var vm = this;
  var cache = AppCache('UserCashbox');

  if ($state.params.id) {
    vm.stateParams = cache.stateParams = $state.params;
  } else {
    vm.stateParams = cache.stateParams;
  }

  // the user object that is either edited or created
  vm.user = {};
  vm.cashboxes = [];

  // exposed methods
  vm.submit = submit;
  vm.closeModal = closeModal;

  vm.onCashBoxChange = function onCashBoxChange(cashboxes) {
    vm.user.cashboxes = cashboxes;
  };

  // submit the data to the server from all two forms (update, create)
  function submit(userForm) {
    if (userForm.$invalid || !vm.user.id) { return; }
    return Users.cashBoxManagement(vm.user.id, vm.user.cashboxes)
      .then(function () {
        Notify.success('USERS.UPDATED');
        $state.go('users.list');
      })
      .catch(Notify.handleError);
  }

  Users.cashboxes(vm.stateParams.id)
    .then(function (cashboxes) {
      vm.cashboxes = cashboxes;
    })
    .catch(Notify.handleError);

  Users.read(vm.stateParams.id)
    .then(function (user) {
      vm.user = user;
    })
    .catch(Notify.handleError);

  function closeModal() {
    $state.go('users.list');
  }

}
