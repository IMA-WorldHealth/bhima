angular.module('bhima.controllers')
  .controller('UsersDepotManagementController', UsersDepotManagementController);

UsersDepotManagementController.$inject = [
  '$state', 'UserService',
  'NotifyService', 'appcache',
];

function UsersDepotManagementController($state, Users, Notify, AppCache) {
  const vm = this;
  const cache = AppCache('UserDepot');

  if ($state.params.id) {
    cache.stateParams = $state.params;
    vm.stateParams = cache.stateParams;
  } else {
    vm.stateParams = cache.stateParams;
  }

  // the user object that is either edited or created
  vm.user = {};
  vm.depots = [];

  // exposed methods
  vm.submit = submit;
  vm.closeModal = closeModal;

  vm.onDepotChange = (depots) => {
    vm.user.depots = depots;
  };

  // submit the data to the server from all two forms (update, create)
  function submit(userForm) {
    if (userForm.$invalid || !vm.user.id) { return 0; }
    return Users.updateDepots(vm.user.id, vm.user.depots)
      .then(() => {
        Notify.success('USERS.UPDATED');
        $state.go('users.list');
      })
      .catch(Notify.handleError);
  }

  Users.depots(vm.stateParams.id)
    .then((depots) => {
      vm.depots = depots;
    })
    .catch(Notify.handleError);

  Users.read(vm.stateParams.id)
    .then((user) => {
      vm.user = user;
    })
    .catch(Notify.handleError);

  function closeModal() {
    $state.go('users.list');
  }

}
