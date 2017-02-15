angular.module('bhima.routes')
  .config(['$stateProvider', function purchaseRoutes($stateProvider) {
    $stateProvider
        // purchases/create
        .state('purchasesCreate', {
          url         : '/purchases/create',
          controller  : 'PurchaseOrderController as PurchaseCtrl',
          templateUrl : 'partials/purchases/create/create.html',
        })

        // purchases/list
        .state('purchasesList', {
          url         : '/purchases/list',
          controller  : 'PurchaseListController as PurchaseListCtrl',
          templateUrl : 'partials/purchases/list/list.html',
        });
  }]);
