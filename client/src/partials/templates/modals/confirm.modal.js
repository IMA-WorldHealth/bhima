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

  /**
   * bind the prompt to the view, if provided
   * @todo - should this be done automatically with controllerAs?
   */
  vm.prompt = prompt;

  // bind modal controls
  vm.close = Instance.close;
}
