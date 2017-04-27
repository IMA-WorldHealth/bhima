angular.module('bhima.routes')
  .config(['$stateProvider', function purchaseRoutes($stateProvider) {
    $stateProvider
        // purchases/create
        .state('purchasesCreate', {
          url         : '/purchases/create',
          controller  : 'PurchaseOrderController as PurchaseCtrl',
          templateUrl : 'modules/purchases/create/create.html',
        })

        // purchases/list
        .state('purchasesList', {
          url         : '/purchases/list',
          controller  : 'PurchaseListController as PurchaseListCtrl',
          templateUrl : 'modules/purchases/list/list.html',
        });
  }]);
