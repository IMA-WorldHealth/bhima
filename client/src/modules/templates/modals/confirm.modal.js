angular.module('bhima.controllers')
  .controller('ConfirmModalController', ConfirmModalController);

ConfirmModalController.$inject = ['$uibModalInstance', 'prompt'];

/**
 * Confirm Modal Controller
 *
 * This controller provides bindings for the confirm modal.
 */
function ConfirmModalController(Instance, prompt) {
  var vm = this;

  vm.dismiss = function dismis() { return Instance.close(false); } ;
  vm.submit = function submit() { return Instance.close(true); };
  vm.prompt = prompt || 'FORM.DIALOGS.CONFIRM_DELETE';
}
