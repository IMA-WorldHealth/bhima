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
  
  vm.dismiss = function dismis (){
   return Instance.close(false);	
  } 

  /**
   * bind the prompt to the view, if provided
   * @todo - should this be done automatically with controllerAs?
   */
  vm.prompt = prompt;

  vm.submit = function submit () {
  	return Instance.close(true);
  }

  // bind modal controls
  vm.close = Instance.close;
}
