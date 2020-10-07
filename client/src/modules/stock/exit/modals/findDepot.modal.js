angular.module('bhima.controllers')
  .controller('StockFindDepotModalController', StockFindDepotModalController);

StockFindDepotModalController.$inject = [
  '$uibModalInstance', 'DepotService', 'NotifyService', 'data',
  'StockService', 'SessionService',
];

function StockFindDepotModalController(Instance, Depot, Notify, Data, Stock, Session) {
  const vm = this;
  const enableStrictDepotDistribution = Session.stock_settings.enable_strict_depot_distribution;

  // global
  vm.selected = {};

  // bind methods
  vm.submit = submit;
  vm.cancel = cancel;

  if (enableStrictDepotDistribution) {
    Depot.read(Data.depot.uuid)
      .then(depot => {
        // forbid to distribute to the same depot
        vm.depots = extractDepotFromCollection(Data.depot.uuid, depot.distribution_depots);
      })
      .catch(Notify.handleError);
  } else {
    Depot.read()
      .then(depots => {
        // set defined the previous selected depot
        if (Data.entity_uuid) {
          const currentDepot = depots.filter(item => {
            return item.uuid === Data.entity_uuid;
          });

          vm.selected = currentDepot.length > 0 ? currentDepot[0] : {};
        }

        // forbid to distribute to the same depot
        vm.depots = extractDepotFromCollection(Data.depot.uuid, depots);
      })
      .catch(Notify.handleError);
  }

  function extractDepotFromCollection(depotUuid, collection) {
    const idx = collection.findIndex(i => (i.uuid === depotUuid));
    if (idx > -1) { collection.splice(idx, 1); }
    return collection;
  }

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
      vm.requisitionLabel = 'label label-primary';
      throw new Error('Requisition Not Found');
    }

    if (requisition.status_key === 'done' || requisition.status_key === 'completed'
      || requisition.status_key === 'excessive') {
      vm.requisitionMessage = 'REQUISITION.ALREADY_USED';
      vm.requisitionLabel = 'label label-success';
      throw new Error('Requisition Already Used');
    }

    if (requisition.status_key === 'cancelled') {
      vm.requisitionMessage = 'REQUISITION.CANCELLED';
      vm.requisitionLabel = 'label label-danger';
      throw new Error('Requisition Cancelled');
    }

    return Stock.stockRequisition.read(requisition.uuid, { balance : true });
  }

  function depotDetails(requisition) {
    vm.requisition = requisition;

    if (vm.requisition.depot_uuid !== Data.depot.uuid) {
      vm.requisitionMessage = 'REQUISITION.NOT_FOR_DEPOT';
      vm.requisitionLabel = 'label label-warning';
      throw new Error('This requisition is not for this depot');
    }

    return Depot.read(null, { uuid : vm.requisition.requestor_uuid });
  }

  function assignDepotRequisition([depot]) {
    if (Data.depot.uuid === vm.selected.uuid) {
      vm.requisitionMessage = 'REQUISITION.NOT_FOR_THE_SAME_DEPOT';
      vm.requisitionLabel = 'label label-danger';
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
