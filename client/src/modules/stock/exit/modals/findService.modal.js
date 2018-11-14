angular.module('bhima.controllers')
  .controller('StockFindServiceModalController', StockFindServiceModalController);

StockFindServiceModalController.$inject = [
  '$uibModalInstance', 'ServiceService', 'NotifyService', 'data',
];

function StockFindServiceModalController(Instance, Service, Notify, Data) {
  const vm = this;

  // bind methods
  vm.submit = submit;
  vm.cancel = cancel;
  vm.clear = clear;

  Service.read()
    .then(services => {
      vm.services = services;

      // set defined the previous selected service
      if (Data.entity_uuid) {
        const currentService = services.filter(item => {
          return item.uuid === Data.entity_uuid;
        });

        vm.selected = currentService.length > 0 ? currentService[0] : undefined;
      }
    })
    .catch(Notify.handleError);

  function clear(element) {
    delete vm[element];
  }

  // submit
  function submit(form) {
    if (form.$invalid) { return; }
    Instance.close(vm.selected);
  }

  // cancel
  function cancel() {
    Instance.close(vm.selected);
  }

}
