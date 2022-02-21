angular.module('bhima.controllers')
  .controller('ShipmentOverviewModalController', ShipmentOverviewModalController);

ShipmentOverviewModalController.$inject = [
  '$state', 'params', 'ShipmentService', 'NotifyService',
  'bhConstants',
];

function ShipmentOverviewModalController($state, params, Shipments, Notify) {
  const vm = this;
  const identifier = params.uuid;

  load();

  function load() {
    if (identifier) {
      Shipments.read(identifier)
        .then(shipment => {
          vm.shipment = shipment;
          return Shipments.overview(identifier);
        })
        .then(result => {
          vm.step = result.step;
          vm.locations = result.locations;
          console.log(vm.shipment);
        })
        .catch(Notify.handleError);
    }
  }
}
