angular.module('bhima.controllers')
  .controller('StockFindServiceModalController', StockFindServiceModalController);

StockFindServiceModalController.$inject = [
  '$uibModalInstance', 'ServiceService', 'NotifyService', 'data',
  'StockService', 'RequisitionHelperService',
];

function StockFindServiceModalController(Instance, Service, Notify, Data, Stock, RequisitionHelpers) {
  const vm = this;

  vm.selected = {};

  // bind methods
  vm.submit = submit;
  vm.cancel = cancel;
  vm.clear = clear;

  Service.read(null, { hidden : 0 })
    .then(services => {
      vm.services = services;
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
      return RequisitionHelpers.lookupRequisitionByReference(vm.reference)
        .then(requisition => RequisitionHelpers.isRequisitionForDepot(requisition, Data.depot))
        .then(serviceDetails)
        .then(assignServiceRequisition)
        .catch(err => {

          // bind the error flags as needed
          vm.requisitionMessage = err.message;
          vm.requisitionLabel = err.label;
          Notify.handleError(err);
        });
    }

    if (form.$invalid && !vm.requisition.uuid) { return null; }
    return Instance.close(vm.selected);
  }

  function serviceDetails(requisition) {
    vm.requisition = requisition;
    return Service.read(null, { uuid : vm.requisition.requestor_uuid });
  }

  function assignServiceRequisition([service]) {
    RequisitionHelpers.isRequisitionForService(vm.requisition, service);

    vm.selected = service;
    vm.selected.requisition = vm.requisition;

    Instance.close(vm.selected);
  }

  // cancel
  function cancel() {
    Instance.close(vm.selected);
  }
}
