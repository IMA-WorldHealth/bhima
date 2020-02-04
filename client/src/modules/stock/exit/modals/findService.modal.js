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
      vm.services = services.filter(s => !s.hidden);
      [vm.selected] = services.filter(s => s.uuid === Data.entity_uuid);
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
        .then(requisitionDetails)
        .then(serviceDetails)
        .then(assignServiceRequisition)
        .catch(Notify.handleError);
    }

    if (form.$invalid && !vm.requisition.uuid) { return null; }
    return Instance.close(vm.selected);
  }

  function requisitionDetails([requisition]) {
    if (!requisition || !requisition.uuid) {
      vm.requisitionMessage = 'REQUISITION.VOUCHER_NOT_FOUND';
      throw new Error('Requisition Not Found');
    }

    if (requisition.status_key === 'done') {
      vm.requisitionMessage = 'REQUISITION.ALREADY_USED';
      throw new Error('Requisition Already Used');
    }

    return Stock.stockRequisition.read(requisition.uuid);
  }

  function serviceDetails(requisition) {
    vm.requisition = requisition;
    return Service.read(null, { uuid : vm.requisition.requestor_uuid });
  }

  function assignServiceRequisition([service]) {
    if (!service || !service.id) {
      vm.requisitionMessage = 'REQUISITION.NOT_FOR_SERVICE';
      throw new Error('The requisition is not for services');
    }

    vm.selected = service;
    vm.selected.requisition = vm.requisition;
    Instance.close(vm.selected);
  }

  // cancel
  function cancel() {
    Instance.close(vm.selected);
  }

}
