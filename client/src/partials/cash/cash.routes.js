angular.module('bhima.routes')
  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider

      .state('cashRegistry', {
        url : '/payments',
        controller: 'CashPaymentRegistryController as CPRCtrl',
        templateUrl: 'partials/cash/payments/registry.html'
      })

      .state('cash', {
        url : '/cash',
        abstract: true,
        controller: 'CashController as CashCtrl',
        templateUrl: '/partials/cash/cash.html'
      })

      .state('cash.select', {
        url : '/selection',
        params : { id : { value: null } },
        onEnter :['$uibModal', cashboxSelectionModal],
        onExit : ['$uibModalStack', closeModal]
      })

      .state('cash.window', {
        url : '/:id?',
        params : { id : { squash: true, value: null } },
        controller: 'CashController as CashCtrl',
        templateUrl: '/partials/cash/cash.html'
      })

      .state('cash.transfer', {
        url : '/:id/transfer',
        params : { id : { squash: true, value: null } },
        onEnter :['$state', '$uibModal', transferModal],
        onExit : ['$uibModalStack', closeModal]
      })

      .state('cash.scan', {
        url : '/:id/scan',
        params : { id : { squash: true, value: null } },
        onEnter :['$state', '$uibModal', scanBarcodeModal],
        onExit : ['$uibModalStack', closeModal]
      });
  }]);


function cashboxSelectionModal(Modal) {
  Modal.open({
    templateUrl: 'partials/cash/modals/selectCashbox.modal.html',
    controller: 'SelectCashboxModalController as $ctrl',
    backdrop: 'static',
    keyboard: false
  });
}

function transferModal($state, Modal) {
  Modal.open({
    controller: 'CashTransferModalController as TransferCtrl',
    templateUrl: 'partials/cash/modals/transfer.modal.html',
    backdrop: 'static',
    keyboard: false
  });
}

function scanBarcodeModal($state, Modal) {
  Modal.open({
    controller: 'CashBarcodeScannerModalController as CashBarCtrl',
    templateUrl: 'partials/cash/modals/scanBarcode.modal.html',
    size : 'lg',
    backdrop: 'static',
    keyboard: true
  }).result.catch(function () {
    $state.go('^.window', $state.params);
  });
}

function closeModal($uibModalStack) {
  $uibModalStack.dismissAll();
}
