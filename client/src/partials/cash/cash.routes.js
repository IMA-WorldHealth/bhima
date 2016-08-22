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
        onEnter :['$state', '$uibModal', cashboxSelectionModal]
      })

      .state('cash.window', {
        url : '/:id?',
        params : { id : { squash: true, value: null } },
        controller: 'CashController as CashCtrl',
        templateUrl: '/partials/cash/cash.html'
      });
  }]);


function cashboxSelectionModal($state, Modal) {
  Modal.open({
    templateUrl: 'partials/cash/modals/selectCashbox.modal.html',
    controller: 'SelectCashboxModalController as $ctrl',
    backdrop: 'static',
    keyboard: false
  });
}
