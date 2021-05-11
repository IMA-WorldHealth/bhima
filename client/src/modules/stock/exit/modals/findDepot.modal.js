angular.module('bhima.controllers')
  .controller('StockFindDepotModalController', StockFindDepotModalController);

StockFindDepotModalController.$inject = [
  '$uibModalInstance', 'DepotService', 'NotifyService', 'data',
  'StockService', 'SessionService', 'RequisitionHelperService',
];

function StockFindDepotModalController(Instance, Depot, Notify, Data, Stock, Session, RequisitionHelpers) {
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
          const currentDepot = depots.find(item => item.uuid === Data.entity_uuid);
          vm.selected = currentDepot || {};
        }

        // forbid to distribute to the same depot
        vm.depots = extractDepotFromCollection(Data.depot.uuid, depots);
      })
      .catch(Notify.handleError);
  }

  function extractDepotFromCollection(depotUuid, collection) {
    return collection.filter(depot => depot.uuid !== depotUuid);
  }

  vm.onChangeReference = reference => {
    vm.reference = reference;
  };

  // submit
  function submit(form) {

    if (vm.reference) {
      return RequisitionHelpers.lookupRequisitionByReference(vm.reference)
        .then(requisition => RequisitionHelpers.isRequisitionForDepot(requisition, Data.depot))
        .then(depotDetails)
        .then(assignDepotRequisition)
        .catch(err => {
          // bind the error flags as needed
          vm.requisitionMessage = err.message;
          vm.requisitionLabel = err.label;
          Notify.handleError(err);
        });
    }

    if (form.$invalid && (vm.requisition && !vm.requisition.uuid)) { return null; }

    return Instance.close(vm.selected);
  }

  function depotDetails(requisition) {
    vm.requisition = requisition;
    return Depot.read(null, { uuid : vm.requisition.requestor_uuid });
  }

  function assignDepotRequisition([depot]) {
    if (Data.depot.uuid === vm.selected.uuid) {
      const err = new Error('REQUISITION.NOT_FOR_THE_SAME_DEPOT');
      err.label = 'label label-danger';
      throw err;
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
