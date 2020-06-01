angular.module('bhima.controllers')
  .controller('CronEmailModalController', CronEmailModalController);

CronEmailModalController.$inject = ['$uibModalInstance', 'options'];

function CronEmailModalController(Modal, options) {
  const vm = this;
  vm.close = Modal.close;
  vm.options = options;
}
