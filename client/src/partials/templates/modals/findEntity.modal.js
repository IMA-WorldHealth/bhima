angular.module('bhima.controllers')
.controller('FindEntityModalController', FindEntityModalController);

FindEntityModalController.$inject = ['$uibModalInstance'];

/**
 * Find Entity Modal Controller
 *
 * This controller provides bindings for the find entity modal.
 */
function FindEntityModalController(Instance) {
  var vm = this;

  vm.types = [
    { code : 'D', label : 'VOUCHERS.COMPLEX.DEBTOR' },
    { code : 'C', label : 'VOUCHERS.COMPLEX.CREDITOR' }
  ];

  vm.selectedTypeLabel = 'VOUCHERS.COMPLEX.DEB_CRED';

  vm.setType = setType;
  vm.submit = submit;
  vm.cancel = cancel;

  function setType(type) {
    vm.selectedType = type;
    vm.selectedTypeLabel = type.label;
  }

  function submit() {
    Instance.close(vm.selectedType);
  }

  function cancel() {
    Instance.dismiss('cancel');
  }

}
