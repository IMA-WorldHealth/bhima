angular.module('bhima.components')
  .component('bhVoucherToolsCorrect', {
    templateUrl : 'modules/voucher-tools/correct/voucher-tools.correct.tmpl.html',
    controller : bhVoucherToolsCorrect,
    bindings : {
      source : '<',
      onClose : '&?',
      showBadge : '@?',
    },
  });

bhVoucherToolsCorrect.$inject = ['VoucherToolsService'];

function bhVoucherToolsCorrect(VoucherTools) {
  const $ctrl = this;

  $ctrl.onTestRoutine = function onTestRoutine() {
    const temporaryVoucherDetails = {
      rows : []
    };

    VoucherTools.correctTransaction($ctrl.input.record_uuid, temporaryVoucherDetails)
      .then((result) => {
        console.log('client component got result', result);
      })
      .catch((error) => {
        console.log('client component failed with', error);
      });
  }

  $ctrl.$onChanges = function onChanges(changes) {
    if(changes.source && changes.source.currentValue) {
      $ctrl.input = changes.source.currentValue;
    }
  }
}
