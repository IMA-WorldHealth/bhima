angular.module('bhima.controllers')
  .controller('StockFindServiceModalController', StockFindServiceModalController);

StockFindServiceModalController.$inject = [
  '$uibModalInstance', 'ServiceService', 'NotifyService', 'data',
  'StockService',
];

function StockFindServiceModalController(Instance, Service, Notify, Data, Stock) {
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

  vm.onChangeReference = reference => {
    vm.reference = reference;
  };

  // submit
  function submit(form) {
    if (vm.reference) {
      return Stock.stockRequisition.read(null, { reference : vm.reference })
        .then(([requisition]) => {
          if (!requisition || !requisition.uuid) { throw new Error('Requisition Not Found'); }
          return Stock.stockRequisition.read(requisition.uuid);
        })
        .then(requisition => {
          vm.requisition = requisition;
          return Service.read(null, { uuid : vm.requisition.requestor_uuid });
        })
        .then(([service]) => {
          if (!service || !service.id) { return; }
          vm.selected = service;
          vm.selected.requisition = vm.requisition;
          Instance.close(vm.selected);
        })
        .catch(Notify.handleError);
    }

    if (form.$invalid && !vm.requisition.uuid) { return null; }
    return Instance.close(vm.selected);
  }

  // cancel
  function cancel() {
    Instance.close(vm.selected);
  }

}
