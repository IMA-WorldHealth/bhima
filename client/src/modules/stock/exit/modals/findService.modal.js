angular.module('bhima.controllers')
  .controller('StockFindServiceModalController', StockFindServiceModalController);

StockFindServiceModalController.$inject = [
  '$uibModalInstance', 'ServiceService', 'NotifyService',
];

function StockFindServiceModalController(Instance, Service, Notify) {
  var vm = this;

  // global
  vm.selected = {};

  // bind methods
  vm.submit = submit;
  vm.cancel = cancel;

  Service.read(null, { full : 1 })
  .then(function (services) {
    vm.services = services;
  })
  .catch(Notify.handleError);

  // submit
  function submit() {
    Instance.close(vm.selected);
  }

  // cancel
  function cancel() {
    Instance.dismiss();
  }

}
