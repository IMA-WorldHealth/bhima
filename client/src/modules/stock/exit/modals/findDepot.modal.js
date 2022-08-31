angular.module('bhima.controllers')
  .controller('StockFindDepotModalController', StockFindDepotModalController);

StockFindDepotModalController.$inject = [
  '$uibModalInstance', 'DepotService', 'NotifyService', 'data',
  'SessionService', 'RequisitionHelperService', 'ShipmentService',
  'ModalService', '$translate',
];

function StockFindDepotModalController(
  Instance, Depot, Notify, Data,
  Session, RequisitionHelpers, Shipments,
  Modal, $translate,
) {
  const vm = this;

  const enableStrictDepotDistribution = Session.stock_settings.enable_strict_depot_distribution;

  // global
  vm.selected = {};
  vm.depot = Data.depot;
  vm.loading = false;

  // bind methods
  vm.submit = submit;
  vm.cancel = cancel;

  // Make sure this user has permissions to exit from this depot
  if (enableStrictDepotDistribution) {
    Depot.read(Data.depot.uuid, { only_user : true })
      .then(originDepot => {
        if (!originDepot) {
          Instance.close();
          const errMsg = $translate.instant('STOCK.ERRORS.NO_PERMISSION_ORIGIN_DEPOT',
            { depot : vm.depot.text });
          Modal.alert(errMsg);
        }
      });
  }

  // Load the depots
  Depot.read()
    .then(depots => {
      // NOTE: We do not care about the 'enableStrictDepotDistribution' flag for the
      //       the destination depot since the user doing the stock exit (here) does
      //       not necessarily need permission to access the destination depot.

      // set the previous selected depot (if given)
      if (Data.entity_uuid) {
        const currentDepot = depots.find(item => item.uuid === Data.entity_uuid);
        vm.selected = currentDepot || {};
      }

      // Prevent distribution to the same depot
      vm.depots = removeDepotFromCollection(Data.depot.uuid, depots);
    })
    .finally(() => {
      vm.loading = false;
    })
    .catch(Notify.handleError);

  function removeDepotFromCollection(depotUuid, collection) {
    return collection.filter(depot => depot.uuid !== depotUuid);
  }

  vm.onChangeReference = reference => {
    vm.reference = reference;
  };

  vm.depotSelected = () => {
    return vm.selected && ('uuid' in vm.selected);
  };

  vm.onChangeShipmentReference = shipment => {
    if (shipment) {
      vm.shipment = shipment;
      vm.shipmentReference = shipment.reference;
      vm.selected = vm.depots.find(item => item.uuid === shipment.destination_depot_uuid);
    } else {
      delete vm.shipment;
      delete vm.shipmentReference;
      vm.selected = {};
    }
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

    if (vm.shipment && vm.shipment.uuid) {
      return Depot.read(vm.shipment.destination_depot_uuid)
        .then(depot => {
          vm.selected = depot;
          return Shipments.readAll(vm.shipment.uuid);
        })
        .then(shipmentItems => {
          vm.selected.shipment = shipmentItems;
          Instance.close(vm.selected);
        })
        .catch(err => {
          // bind the error flags as needed
          vm.requisitionMessage = err.message;
          vm.requisitionLabel = err.label;
          Notify.handleError(err);
        });
    }

    if (form.$invalid && (vm.requisition && !vm.requisition.uuid)) { return null; }

    if (form.$invalid && (vm.shipment && !vm.shipment.uuid)) { return null; }

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
    Instance.close();
  }
}
