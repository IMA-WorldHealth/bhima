angular.module('bhima.controllers')
  .controller('StockFindServiceModalController', StockFindServiceModalController);

StockFindServiceModalController.$inject = [
  '$uibModalInstance', 'ServiceService', 'NotifyService', 'data',
];

function StockFindServiceModalController(Instance, Service, Notify, Data) {
  const vm = this;

  // global
  vm.selected = {};

  // bind methods
  vm.submit = submit;
  vm.cancel = cancel;

  Service.read()
    .then(services => {
      vm.services = services;

      // set defined the previous selected service
      if (Data.entity_uuid) {
        const currentService = services.filter(item => {
          return item.uuid === Data.entity_uuid;
        });

        vm.selected = currentService.length > 0 ? currentService[0] : {};
      }
    })
    .catch(Notify.handleError);

  // submit
  function submit() {
    Instance.close(vm.selected);
  }

  // cancel
  function cancel() {
    Instance.close(vm.selected);
  }

}
