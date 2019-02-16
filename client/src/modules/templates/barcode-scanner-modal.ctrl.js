angular.module('bhima.controllers')
  .controller('BarcodeModalController', BarcodeModalController);

BarcodeModalController.$inject = ['options', '$uibModalInstance'];

function BarcodeModalController(options, ModalInstance) {
  const vm = this;
  vm.dismiss = ModalInstance.dismiss;
  vm.options = options;
  vm.onScanCallback = (result) => ModalInstance.close(result);
}
