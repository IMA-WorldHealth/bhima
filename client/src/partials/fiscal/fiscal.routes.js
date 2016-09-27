angular.module('bhima.routes')
  .config([ '$stateProvider', function ($stateProvider) {

    $stateProvider
      .state('fiscal', {
        url : '/fiscal',
        abstract : true,
        params : {
          id : { squash : true, value : null }
        },
        controller: 'FiscalController as FiscalCtrl',
        templateUrl: 'partials/fiscal/fiscal.html'
      })
      .state('fiscal.list', {
        url : '',
        templateUrl : 'partials/fiscal/fiscal.list.html'
      })
      .state('fiscal.create', {
        url : '/create',
        controller : 'FiscalManagementController as FiscalManageCtrl',
        templateUrl : 'partials/fiscal/fiscal.manage.html'
      })
      .state('fiscal.update', {
        url : '/update',
        controller : 'FiscalManagementController as FiscalManageCtrl',
        templateUrl : 'partials/fiscal/fiscal.manage.html',
        data : { label : null }
      })
      .state('fiscal.openingBalance', {
        url : '/opening_balance',
        controller : 'FiscalOpeningBalanceController as FiscalOBCtrl',
        templateUrl : 'partials/fiscal/fiscal.openingBalance.html'
      });
  }]);
