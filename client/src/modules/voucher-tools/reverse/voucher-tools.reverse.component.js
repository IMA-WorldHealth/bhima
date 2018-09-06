angular.module('bhima.components')
  .component('bhVoucherToolsReverse', {
    templateUrl : 'modules/voucher-tools/reverse/voucher-tools.reverse.tmpl.html',
    controller : bhVoucherToolsReverse,
    bindings : {
      source : '<',
      showBadge : '@?',
    },
  });

bhVoucherToolsReverse.$inject = ['VoucherService'];

/**
 * @component bhVoucherToolsReverse
 *
 * @description
 * A tool in the voucher-tools collection. Responsible for reversing any given
 * transaction.
 *
 * Bindings:
 * `source`: an object defining the input parameters for the reverse action, in
 *           this case source expects an object defining a (required) `transaction_id`
 * `show-badge`: display the `bh-voucher-tools-status-badge` element
 *
 * @example
 * ```html
 * <bh-voucher-tools-reverse
 *  source="{ transaction_id : Ctrl.transaction_id">
 * </bh-voucher-tools-reverse>
 * ```
 */
function bhVoucherToolsReverse(Vouchers) {
  const $ctrl = this;

  $ctrl.$onInit = function onInit() {
  };

  $ctrl.$onChanges = function onChanges(changes) {
    if (changes.source && changes.source.currentValue) {

    }

    if (changes.showBadge && angular.isDefined(changes.showBadge.currentValue)) {
      // any binding for show-badge should be accepted by the `ng-if` condition
      $ctrl.showBadge = true;
    }

    console.log(changes);
  };
}
