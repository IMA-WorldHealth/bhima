angular.module('bhima.controllers')
  .controller('ReadyForShipmentModalController', ReadyForShipmentModalController);

ReadyForShipmentModalController.$inject = [
  '$state', 'params', 'ShipmentService', 'NotifyService',
  'bhConstants',
];

function ReadyForShipmentModalController($state, params, Shipments, Notify, Constants) {
  const vm = this;
  const identifier = params.uuid;

  vm.submit = submit;

  load();

  function load() {
    if (identifier) {
      Shipments.read(identifier)
        .then(shipment => {
          vm.shipment = shipment;
          vm.isInDepot = !!(shipment.status_id === Constants.shipmentStatus.AT_DEPOT);
        })
        .catch(Notify.handleError);
    }
  }

  function submit(form) {
    if (form.$invalid) { return null; }

    return Shipments.setReadyForShipment(identifier)
      .then(() => {
        Notify.success('SHIPMENT.UPDATED');
        $state.go('shipments', null, { reload : true });
      })
      .catch(Notify.handleError);
  }
}
