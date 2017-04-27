
angular.module('bhima.controllers')
.controller('UsersPasswordModalController', UsersPasswordModalController);

UsersPasswordModalController.$inject = [ '$state', 'UserService', 'NotifyService' ];

/**
* User Password Modal Controller
*
* This controller is responsible for changing a user's password.  Provides a
* simply modal interface to
*/
function UsersPasswordModalController($state, Users, Notify) {
  var vm = this;

  vm.validPassword = validPassword;
  vm.submit = submit;
  vm.cancel = cancel;

  // checks if a valid password exists
  function validPassword() {
    return Users.validatePassword(vm.user.password, vm.user.passwordVerify);
  }

  // submits the password form
  function submit(passwordForm) {
    if (passwordForm.$invalid) { return; }
    if (!passwordForm.$dirty || !validPassword()) { return; }

    // try to update the user's password
    return Users.updatePassword(vm.user.id, { password : vm.user.password })
      .then(function () {
        Notify.success('USERS.UPDATED');
        $state.go('users.edit', {id : vm.user.id, creating : false});
      })
      .catch(Notify.handleError);
  }

  function cancel() {
    $state.go('users.edit', {id : vm.user.id, creating : false});
  }

  Users.read($state.params.id)
    .then(function (user) {
      vm.user = user;
    })
    .catch(Notify.handleError);
}
