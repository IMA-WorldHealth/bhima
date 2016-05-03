angular.module('bhima.controllers')
.controller('FindEntityModalController', FindEntityModalController);

FindEntityModalController.$inject = ['$uibModalInstance', 'prompt'];

/**
 * Find Entity Modal Controller
 *
 * This controller provides bindings for the find entity modal.
 */
function FindEntityModalController(Instance, prompt) {
  var vm = this;

  /**
   * bind the prompt to the view, if provided
   * @todo - should this be done automatically with controllerAs?
   */
  vm.prompt = prompt;

  // bind modal controls
  vm.close = Instance.close;
}
