angular.module('bhima.controllers')
  .controller('StockFindDepotModalController', StockFindDepotModalController);

StockFindDepotModalController.$inject = [
  '$uibModalInstance', 'DepotService', 'NotifyService', 'data',
  'StockService',
];

function StockFindDepotModalController(Instance, Depot, Notify, Data, Stock) {
  const vm = this;
  const bundle = {};

  // global
  vm.selected = {};

  // bind methods
  vm.submit = submit;
  vm.cancel = cancel;

  Depot.read()
    .then(depots => {
      bundle.depots = depots;

      // set defined the previous selected depot
      if (Data.entity_uuid) {
        const currentDepot = depots.filter(item => {
          return item.uuid === Data.entity_uuid;
        });

        vm.selected = currentDepot.length > 0 ? currentDepot[0] : {};
      }

      return depots.findIndex(item => {
        return item.uuid === Data.depot.uuid;
      });
    })
    .then(idx => {
      bundle.depots.splice(idx, 1);
      vm.depots = bundle.depots;
    })
    .catch(Notify.handleError);

  vm.onChangeReference = reference => {
    vm.reference = reference;
  };

  // submit
  function submit(form) {
    if (vm.reference) {
      return Stock.stockRequisition.read(null, { reference : vm.reference })
        .then(requisitionDetails)
        .then(depotDetails)
        .then(assignDepotRequisition)
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

    if (requisition.status_key === 'done' || requisition.status_key === 'completed') {
      vm.requisitionMessage = 'REQUISITION.ALREADY_USED';
      throw new Error('Requisition Already Used');
    }

    if (requisition.status_key === 'cancelled') {
      vm.requisitionMessage = 'REQUISITION.CANCELLED';
      throw new Error('Requisition Cancelled');
    }

    return Stock.stockRequisition.read(requisition.uuid, { balance : true });
  }

  function depotDetails(requisition) {
    vm.requisition = requisition;

    if (vm.requisition.depot_uuid !== Data.depot.uuid) {
      vm.requisitionMessage = 'REQUISITION.NOT_FOR_DEPOT';
      throw new Error('The requisition is not for depots');
    }

    return Depot.read(null, { uuid : vm.requisition.requestor_uuid });
  }

  function assignDepotRequisition([depot]) {
    if (Data.depot.uuid === vm.selected.uuid) {
      vm.requisitionMessage = 'REQUISITION.NOT_FOR_THE_SAME_DEPOT';
      throw new Error('The requisition cannot be for the same depot');
    }

    vm.selected = depot;
    vm.selected.requisition = vm.requisition;
    Instance.close(vm.selected);
  }

  // cancel
  function cancel() {
    Instance.close(vm.selected);
  }

}
