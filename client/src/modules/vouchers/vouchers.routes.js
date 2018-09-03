angular.module('bhima.routes')
  .config(['$stateProvider', ($stateProvider) => {
    $stateProvider
      .state('simpleVouchers', {
        url         : '/vouchers/simple',
        controller  : 'SimpleJournalVoucherController as SimpleVoucherCtrl',
        templateUrl : 'modules/vouchers/simple-voucher.html',
      })
      .state('vouchersComplex', {
        url         : '/vouchers/complex',
        controller  : 'ComplexJournalVoucherController as ComplexVoucherCtrl',
        templateUrl : 'modules/vouchers/complex-voucher.html',
      })

      // this is the voucher registry
      .state('vouchers', {
        url         : '/vouchers',
        controller  : 'VoucherController as VoucherCtrl',
        templateUrl : 'modules/vouchers/voucher-registry.html',
        params : {
          filters : [],
        },
      })

      .state('simpleVouchers.barcode', {
        url     : '/barcode',
        onEnter : ['$state', '$uibModal', scanBarcodeModal],
        onExit  : ['$uibModalStack', closeModal],
      });
  }]);

function scanBarcodeModal($state, Modal) {
  Modal.open({
    controller  : 'VoucherScanBarcodeController as BarcodeModalCtrl',
    templateUrl : 'modules/templates/barcode-scanner-modal.html',
    size        : 'lg',
    keyboard    : true,
  }).result.finally(() => {
    $state.go('simpleVouchers');
  });
}

function closeModal($uibModalStack) {
  $uibModalStack.dismissAll();
}
