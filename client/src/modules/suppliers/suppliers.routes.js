angular.module('bhima.routes')
  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider
      .state('suppliers', {
        url         : '/suppliers',
        controller  : 'SupplierController as SupplierCtrl',
        templateUrl : '/modules/suppliers/suppliers.html',
      });
  }]);
