var bhReceiptTemplate =
  '<a ng-click="$ctrl.open()" href="">{{ $ctrl.displayValue }}</a>';

angular.module('bhima.components')
  .component('bhReceipt', {
    template : bhReceiptTemplate,
    controller  : bhReceiptController,
    bindings    : {
      value : '<',
      displayValue : '<',
      type : '@',
    },
  });

bhReceiptController.$inject = ['ReceiptModal', '$log'];

function bhReceiptController(ReceiptModal, $log) {
  var $ctrl = this;

  $ctrl.$onInit = function $onInit() {
    // make sure the receipt type exists before it is clicked
    var hasCallbackFn = ReceiptModal[$ctrl.type];
    if (!hasCallbackFn) {
      $log.error('Warning: Cannot find '
        .concat($ctrl.type)
        .concat(' in ReceiptModalService.'));
    }
  };

  $ctrl.open = function open() {
    ReceiptModal[$ctrl.type]($ctrl.value);
  };
}

