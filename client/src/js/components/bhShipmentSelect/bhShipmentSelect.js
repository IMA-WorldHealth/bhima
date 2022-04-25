angular.module('bhima.components')
  .component('bhShipmentSelect', {
    templateUrl : 'js/components/bhShipmentSelect/bhShipmentSelect.html',
    controller  : ShipmentSelectController,
    transclude  : true,
    bindings    : {
      shipmentUuid : '<',
      depotUuid : '<?',
      onSelectCallback : '&',
      required : '@?',
      ready : '@?',
      label : '@?',
    },
  });

ShipmentSelectController.$inject = [
  'ShipmentService', 'NotifyService', 'bhConstants',
];

// Shipment controller
function ShipmentSelectController(Shipment, Notify, bhConstants) {
  const $ctrl = this;

  $ctrl.$onInit = function onInit() {
    $ctrl.label = $ctrl.label || 'FORM.LABELS.REFERENCE_SHIPMENT';
    $ctrl.required = $ctrl.required || false;

    const params = {};

    if ($ctrl.depotUuid) {
      params.origin_depot_uuid = $ctrl.depotUuid;
      params.status = $ctrl.ready ? bhConstants.shipmentStatus.READY_FOR_SHIPMENT : undefined;
    }

    Shipment.read(null, params)
      .then((shipments) => {
        $ctrl.shipments = shipments;
      })
      .catch(Notify.handleError);
  };

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = ($item) => {
    $ctrl.onSelectCallback({ shipment : $item });
  };
}
