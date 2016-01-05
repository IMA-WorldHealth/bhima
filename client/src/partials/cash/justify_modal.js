angular.module('bhima.controllers')
.controller('CashJustifyModalController', CashModalController);

CashModalController.$inject = ['$modalInstance', 'data' ];

function CashModalController($modalInstance, data) {
  var vm = this;

  // bind props
	vm.bill = data;

  // bind methods
  vm.submit = submit;
  vm.cancel = cancel;

	function submit() {
	  $modalInstance.close(vm.bill.justification);
	}

	function cancel() {
	  $modalInstance.dismiss();
	}
}
