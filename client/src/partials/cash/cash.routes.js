angular.module('bhima.routes')
  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider

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

function closeModal($uibModalStack) {
  $uibModalStack.dismissAll();
}


