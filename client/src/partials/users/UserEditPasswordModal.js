
angular.module('bhima.controllers')
.controller('UsersPasswordModalController', UsersPasswordModalController);

UsersPasswordModalController.$inject = [ '$uibModalInstance', 'UserService', 'user', 'NotifyService' ];

/**
* User Passsword Modal Controller
*
* This controller is responsible for changing a user's password.  Provides a
* simply modal interface to
*/
function UsersPasswordModalController($uibModalInstance, Users, user, Notify) {
  var vm = this;

  vm.user = angular.copy(user);

  vm.validPassword = validPassword;
  vm.submit = submit;
  vm.cancel = cancel;

  /* ------------------------------------------------------------------------ */

  // checks if a valid password exists
  function validPassword() {
    return vm.user.password &&
      vm.user.passwordVerify &&
      vm.user.password.length &&
      vm.user.passwordVerify.length &&
      vm.user.password === vm.user.passwordVerify;
  }

  // submits the password form
  function submit(passwordForm) {

    if (passwordForm.invalid) { return; }
    if (!passwordForm.$dirty) { return; }


    // try to update the user's password
    Users.updatePassword(vm.user.id, { password : vm.user.password })
    .then(function () {
      $uibModalInstance.close();
    })
    .catch(Notify.handleError);
  }

  function cancel() {
    $uibModalInstance.dismiss();
  }

}
