angular.module('bhima.routes')
  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider

      .state('cashRegistry', {
        url         : '/payments',
        controller  : 'CashPaymentRegistryController as CPRCtrl',
        templateUrl : 'modules/cash/payments/registry.html',
        params      : {
          filters : null,
          display : null,
        },
      })

      .state('cash', {
        url         : '/cash',
        abstract    : true,
        controller  : 'CashController as CashCtrl',
        templateUrl : '/modules/cash/cash.html',
      })

      .state('cash.select', {
        url     : '/selection',
        params  : { id: { value: null } },
        onEnter : ['$uibModal', cashboxSelectionModal],
        onExit  : ['$uibModalStack', closeModal],
      })

      .state('cash.window', {
        url         : '/:id?',
        params      : { id: { squash: true, value: null } },
        controller  : 'CashController as CashCtrl',
        templateUrl : '/modules/cash/cash.html',
      })

      .state('cash.transfer', {
        url     : '/:id/transfer',
        params  : { id: { squash: true, value: null } },
        onEnter : ['$state', '$uibModal', transferModal],
        onExit  : ['$uibModalStack', closeModal],
      })

      .state('cash.debtors', {
        url    : '/:id/debtors',
        params : {
          id          : { squash: true, value: null },
          debtor_uuid : { value: undefined },
          invoices    : { value: [] },
        },
        onEnter : ['$state', '$uibModal', debtorInvoicesModal],
        onExit  : ['$uibModalStack', closeModal],
      })

      .state('cash.scan', {
        url     : '/:id/scan',
        params  : { id: { squash: true, value: null } },
        onEnter : ['$state', '$uibModal', scanCashBarcodeModal],
        onExit  : ['$uibModalStack', closeModal],
      });
  }]);


function cashboxSelectionModal(Modal) {
  Modal.open({
    templateUrl : 'modules/cash/modals/select-cashbox-modal.html',
    controller  : 'SelectCashboxModalController as $ctrl',
    backdrop    : 'static',
    keyboard    : false,
  });
}

function transferModal($state, Modal) {
  Modal.open({
    controller  : 'CashTransferModalController as TransferCtrl',
    templateUrl : 'modules/cash/modals/transfer-modal.html',
    backdrop    : 'static',
    keyboard    : false,
  });
}

function scanCashBarcodeModal($state, Modal) {
  Modal.open({
    controller  : 'CashBarcodeScannerModalController as BarcodeModalCtrl',
    templateUrl : 'modules/cash/modals/barcode-scanner-modal.html',
    size        : 'lg',
    backdrop    : 'static',
    keyboard    : true,
  }).result.finally(function () {
    $state.go('^.window', { id: $state.params.id });
  });
}

function debtorInvoicesModal($state, Modal) {
  Modal.open({
    templateUrl : 'modules/cash/modals/invoice-modal.html',
    controller  : 'CashInvoiceModalController as CashInvoiceModalCtrl',
    backdrop    : 'static',
    animation   : false,
    keyboard    : true,
  }).result.finally(function () {
    $state.go('^.window', { id: $state.params.id });
  });
}

function closeModal($uibModalStack) {
  $uibModalStack.dismissAll();
}
