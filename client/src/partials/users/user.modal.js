angular.module('bhima.controllers')
  .controller('UserModalController', UserModalController);

UserModalController.$inject = ['$state', '$uibModal', 'ProjectService', 'UserService', 'NotifyService'];

function UserModalController($state, $uibModal, Projects, Users, Notify) {
  var vm = this;

  // the user object that is either edited or created
  vm.user = {};
  vm.isCreating = $state.params.creating;

  //exposed methods
  vm.submit = submit;
  vm.closeModal = closeModal;
  vm.validPassword = validPassword;
  vm.setPasswordModal = setPasswordModal;

  Projects.read().then(function (data) {
    vm.projects = data;
  })
  .catch(Notify.handleError);

  if(!vm.isCreating){

    Users.read($state.params.id)
      .then(function (user) {
        vm.user = user;
      })
      .catch(Notify.handleError);
  }

  // submit the data to the server from all two forms (update, create)
  function submit(userForm) {

    if (userForm.invalid) { return; }
    if (!userForm.$dirty) { return; }

    var promise;

    promise = (vm.isCreating)? Users.create(vm.user) : Users.update(vm.user.id, vm.user);

    promise.then(function () {
          $state.go('users.list', null, {reload : true});
        })
        .catch(Notify.handleError);
  }

  function closeModal (){
    $state.go('users.list', null, {reload : false});
  }

  // make sure that the passwords exist and match.
  function validPassword() {
    return vm.user.password &&
      vm.user.passwordVerify &&
      vm.user.password.length &&
      vm.user.passwordVerify.length &&
      vm.user.password === vm.user.passwordVerify;
  }

  // opens a new modal to let the user set a password
  function setPasswordModal() {
    $uibModal.open({
      templateUrl: 'partials/users/UserEditPasswordModal.html',
      size : 'md',
      animation : true,
      controller:  'UsersPasswordModalController as UsersPasswordModalCtrl',
      resolve:     {
        user : vm.user
      }
    });
  }
}


