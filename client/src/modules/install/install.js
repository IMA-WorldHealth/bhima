angular.module('bhima.controllers')
  .controller('InstallApplicationController', InstallApplicationController);

// dependencies injection
InstallApplicationController.$inject = ['InstallService', '$state', 'NotifyService'];

// controller definition
function InstallApplicationController(InstallService, $state, Notify) {
  var vm = this;

  vm.setup = { enterprise : {}, project : {}, user : {} };

  // expose methods to the view
  vm.submit = submit;

  InstallService.checkBasicInstallExist()
    .then(processCheckResult)
    .catch(Notify.handleError);

  function processCheckResult(alreadyExist) {
    vm.alreadyExist = alreadyExist;

    if (alreadyExist) { $state.go('login'); }
  }

  function notifyInstallSucess() {
    Notify.success('INSTALL.SUCCESS_INSTALL');
    $state.go('login');
  }

  function checkPassword() {
    if (!vm.setup.user.password) { return false; }

    if (vm.setup.user.password !== vm.setup.user.repassword) {
      vm.badPasswords = true;
      return false;
    }

    return true;
  }

  function submit(form) {
    if (form.$invalid) { return 0; }

    if (checkPassword() === false) { return Notify.warn('USERS.PASSWORD_MISMATCH'); }

    return InstallService.proceedInstall(vm.setup)
      .then(notifyInstallSucess)
      .catch(Notify.handleError);
  }
}
