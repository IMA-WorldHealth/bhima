angular.module('bhima.controllers')
  .controller('UsersDepotManagementController', UsersDepotManagementController);

UsersDepotManagementController.$inject = [
  '$state', 'UserService',
  'NotifyService', 'appcache', 'DepotService', 'params',
];

function UsersDepotManagementController($state, Users, Notify, AppCache, Depots, params) {
  const vm = this;
  const cache = AppCache('UserDepot');

  if (params.id) {
    cache.stateParams = params;
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
        $state.go('users.list', null, { reload : true });
      })
      .catch(Notify.handleError);
  }

  Depots.read()
    .then(data => {
      vm.depotsData = data.map(item => {
        item.id = item.uuid;
        item.key = item.text;

        if (item.parent === '0') {
          item.parent = 0;
        }

        return item;
      });

    })
    .catch(Notify.handleError);

  Users.depots(vm.stateParams.id)
    .then((depots) => {
      vm.depotsUser = depots;
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
