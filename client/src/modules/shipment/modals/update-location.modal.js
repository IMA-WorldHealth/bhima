angular.module('bhima.controllers')
  .controller('UpdateLocationModalController', UpdateLocationModalController);

UpdateLocationModalController.$inject = [
  '$state', 'params', 'ShipmentService', 'NotifyService',
  'bhConstants',
];

function UpdateLocationModalController($state, params, Shipments, Notify, Constants) {
  const vm = this;
  const identifier = params.uuid;

  vm.submit = submit;
  vm.onSelectDepot = onSelectDepot;

  load();

  function onSelectDepot(depot) {
    vm.shipment.current_depot_uuid = depot.uuid;
  }

  function load() {
    if (identifier) {
      Shipments.read(identifier)
        .then(shipment => {
          vm.shipment = shipment;
          vm.isInTransit = !!(shipment.status_id === Constants.shipmentStatus.IN_TRANSIT);
        })
        .catch(Notify.handleError);
    }
  }

  function submit(form) {
    if (form.$invalid) { return null; }

    return Shipments.updateLocation(identifier, vm.shipment)
      .then(() => {
        Notify.success('SHIPMENT.UPDATED');
        $state.go('shipments', null, { reload : true });
      })
      .catch(Notify.handleError);
  }
}
