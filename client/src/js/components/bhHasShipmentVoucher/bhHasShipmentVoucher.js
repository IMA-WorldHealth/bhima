angular.module('bhima.components')
  .component('bhHasShipmentVoucher', {
    templateUrl : 'js/components/bhHasShipmentVoucher/bhHasShipmentVoucher.html',
    controller  : bhHasShipmentVoucherController,
    bindings    : {
      message   : '<',
      classeLabel : '<',
      reference : '<',
      depotUuid : '<',
      onChange  : '&',
      requestor : '<?',
    },
  });

bhHasShipmentVoucherController.$inject = [];

function bhHasShipmentVoucherController() {
  const $ctrl = this;

  $ctrl.$onInit = function onInit() {
    $ctrl.shipmentVoucherExist = 0;
    $ctrl.shipmentDisabled = false;
  };

  $ctrl.onChangeVoucherExist = value => {
    $ctrl.shipmentVoucherExist = value;
  };

  $ctrl.onSelectShipment = (shipment) => {
    $ctrl.onChange({ shipment });
  };
}
