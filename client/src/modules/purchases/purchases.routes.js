angular.module('bhima.routes')
  .config(['$stateProvider', function purchaseRoutes($stateProvider) {
    $stateProvider
    // purchases/create
      .state('purchasesCreate', {
        url         : '/purchases/create',
        controller  : 'PurchaseOrderController as PurchaseCtrl',
        templateUrl : 'modules/purchases/create/createUpdate.html',
      })

    // purchases/:uuid/update
      .state('purchasesUpdate', {
        url         : '/purchases/:uuid/update',
        params  : { uuid : { squash : true, value : null } },
        controller  : 'PurchaseOrderController as PurchaseCtrl',
        templateUrl : 'modules/purchases/create/createUpdate.html',
      })

    // purchases/list
      .state('purchasesList', {
        url         : '/purchases',
        controller  : 'PurchaseListController as PurchaseListCtrl',
        templateUrl : 'modules/purchases/registry/registry.html',
      });
  }]);
