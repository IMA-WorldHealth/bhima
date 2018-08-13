angular.module('bhima.controllers')
  .controller('BarcodeModalController', BarcodeModalController);

BarcodeModalController.$inject = ['$uibModalInstance'];

function BarcodeModalController(ModalInstance) {
  const vm = this;
  vm.dismiss = ModalInstance.dismiss;
  vm.onScanCallback = (result) => ModalInstance.close(result);
}
