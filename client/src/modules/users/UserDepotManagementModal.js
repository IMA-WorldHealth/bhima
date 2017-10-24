angular.module('bhima.controllers')
  .controller('UsersDepotManagementController', UsersDepotManagementController);

UsersDepotManagementController.$inject = [
  '$state', 'UserService',
  'NotifyService', 'appcache',
];

function UsersDepotManagementController($state, Users, Notify, AppCache) {
  var vm = this;
  var cache = AppCache('UserDepot');

  if ($state.params.id) {
    vm.stateParams = cache.stateParams = $state.params;
  } else {
    vm.stateParams = cache.stateParams;
  }

  // the user object that is either edited or created
  vm.user = {};
  vm.depots = [];

  // exposed methods
  vm.submit = submit;
  vm.closeModal = closeModal;

  vm.onDepotChange = function onDepotChange(depots) {
    vm.user.depots = depots;
  };

  // submit the data to the server from all two forms (update, create)
  function submit(userForm) {
    if (userForm.$invalid || !vm.user.id) { return; }
    return Users.depotManagement(vm.user.id, vm.user.depots)
      .then(function () {
        Notify.success('USERS.UPDATED');
        $state.go('users.list');
      })
      .catch(Notify.handleError);
  }

  Users.depots(vm.stateParams.id)
    .then(function (depots) {
      vm.depots = depots;
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
