angular.module('bhima.controllers')
  .controller('PackingListModalController', PackingListModalController);

PackingListModalController.$inject = [
  '$state', 'params', 'ShipmentService', 'NotifyService',
  'bhConstants',
];

function PackingListModalController($state, params, Shipments, Notify) {
  const vm = this;
  const identifier = params.uuid;

  load();

  function load() {
    if (identifier) {
      Shipments.overview(identifier)
        .then(result => {
          console.log(result);
          vm.shipment = result.info;
          vm.step = result.step;
          vm.packingList = result.packingList;
        })
        .catch(Notify.handleError);
    }
  }
}
