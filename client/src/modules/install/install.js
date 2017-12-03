angular.module('bhima.controllers')
  .controller('InstallApplicationController', InstallApplicationController);

// dependencies injection
InstallApplicationController.$inject = ['InstallService', '$state', 'NotifyService', 'UserService'];

// controller definition
function InstallApplicationController(InstallService, $state, Notify, Users) {
  var vm = this;

  vm.setup = { enterprise : {}, project : {}, user : {} };

  // expose methods to the view
  vm.submit = submit;

  function notifyInstallSucess() {
    Notify.success('INSTALL.SUCCESS_INSTALL');
    $state.go('login');
  }

  function submit(form) {
    if (form.$invalid) { return 0; }

    if (Users.validatePassword(vm.setup.user.password, vm.setup.user.repassword) === false) {
      vm.badPasswords = true;
      return Notify.warn('USERS.PASSWORD_MISMATCH');
    }

    return InstallService.proceedInstall(vm.setup)
      .then(notifyInstallSucess)
      .catch(Notify.handleError);
  }
}
