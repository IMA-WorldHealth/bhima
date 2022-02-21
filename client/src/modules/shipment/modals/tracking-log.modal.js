angular.module('bhima.controllers')
  .controller('UpdateTrackingLogModalController', UpdateTrackingLogModalController);

UpdateTrackingLogModalController.$inject = [
  '$state', 'params', 'ShipmentService', 'NotifyService',
  'bhConstants',
];

function UpdateTrackingLogModalController($state, params, Shipments, Notify, Constants) {
  const vm = this;
  const identifier = params.uuid;

  vm.submit = submit;

  load();

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
