angular.module('bhima.components')
  .component('bhHasRequisitionVoucher', {
    templateUrl : 'js/components/bhHasRequisitionVoucher/bhHasRequisitionVoucher.html',
    controller  : bhHasRequisitionVoucherController,
    bindings    : {
      message   : '<',
      reference : '<',
      onChange  : '&',
    },
  });

bhHasRequisitionVoucherController.$inject = [];

function bhHasRequisitionVoucherController() {
  const $ctrl = this;

  $ctrl.$onInit = function onInit() {
    $ctrl.requisitionVoucherExist = 0;
  };

  $ctrl.onChangeVoucherExist = value => {
    $ctrl.requisitionVoucherExist = value;
  };

  $ctrl.onChangeReference = () => {
    $ctrl.onChange({ reference : $ctrl.reference });
  };
}
