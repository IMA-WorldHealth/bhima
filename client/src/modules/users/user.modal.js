angular.module('bhima.controllers')
  .controller('UserModalController', UserModalController);

UserModalController.$inject = [
  '$state', 'ProjectService', 'UserService', 'NotifyService', 'appcache',
];

function UserModalController($state, Projects, Users, Notify, AppCache) {
  const vm = this;

  const cache = AppCache('UserModal');

  // the user object that is either edited or created
  vm.user = {};
  vm.stateParams = {};

  // exposed methods
  vm.submit = submit;
  vm.closeModal = closeModal;
  vm.validPassword = validPassword;
  vm.editPassword = editPassword;

  if ($state.params.creating || $state.params.id) {
    cache.stateParams = $state.params;
    vm.stateParams = cache.stateParams;
  } else {
    vm.stateParams = cache.stateParams;
  }

  vm.isCreating = vm.stateParams.creating;

  Projects.read()
    .then((projects) => {
      vm.projects = projects;
    })
    .catch(Notify.handleError);

  if (!vm.isCreating) {
    Users.read(vm.stateParams.id)
      .then((user) => {
        vm.user = user;
        vm.oldUserName = user.username;
      })
      .catch(Notify.handleError);
  } else {
    vm.user.projects = [];
  }

  // submit the data to the server from all two forms (update, create)
  function submit(userForm) {
    if (userForm.$pristine && !vm.isCreating) { return closeModal(); }
    if (userForm.$invalid) { return 0; }

    const promise = (vm.isCreating) ? Users.create(vm.user) : Users.update(vm.user.id, vm.user);

    return promise
      .then(() => {
        const translateKey = (vm.isCreating) ? 'USERS.CREATED' : 'USERS.UPDATED';
        Notify.success(translateKey);
        $state.go('users.list', null, { reload : true });
      })
      .catch(Notify.handleError);
  }

  function closeModal() {
    $state.go('users.list', {}, { reload : false });
  }

  // make sure that the passwords exist and match.
  function validPassword() {
    return Users.validatePassword(vm.user.password, vm.user.passwordVerify);
  }

  // opens a new modal to let the user set a password
  function editPassword() {
    $state.go('users.editPassword', { id : vm.user.id }, { reload : true });
  }
}
