angular.module('bhima.controllers')
  .controller('UserQRCodeController', UserQRCodeController);

UserQRCodeController.$inject = [
  'data', '$uibModalInstance',
];

function UserQRCodeController(data, $uibModalInstance) {
  const vm = this;

  vm.data = data;

  vm.close = $uibModalInstance.close;
}
