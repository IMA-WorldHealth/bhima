angular.module('bhima.routes')
  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider
      .state('fiscal', {
        url         : '/fiscal',
        abstract    : true,
        controller  : 'FiscalController as FiscalCtrl',
        templateUrl : 'modules/fiscal/fiscal.html',
      })
      .state('fiscal.create', {
        url         : '/create',
        controller  : 'FiscalManagementController as FiscalManageCtrl',
        templateUrl : 'modules/fiscal/fiscal.manage.html',
      })
      .state('fiscal.list', {
        url         : '',
        templateUrl : 'modules/fiscal/fiscal.list.html',
      })
      .state('fiscal.update', {
        url         : '/:id/update',
        controller  : 'FiscalManagementController as FiscalManageCtrl',
        templateUrl : 'modules/fiscal/fiscal.manage.html',
        data        : { label: null },
        params      : {
          id : { squash: true, value: null },
        },
      })
      .state('fiscal.openingBalance', {
        url         : '/:id/opening_balance',
        controller  : 'FiscalOpeningBalanceController as FiscalOBCtrl',
        templateUrl : 'modules/fiscal/fiscal.openingBalance.html',
        params      : {
          id : { squash: true, value: null },
        },
      });
  }]);
