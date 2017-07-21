angular.module('bhima.routes')
  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider
      .state('fiscal', {
        url         : '/fiscal',
        abstract    : true,
        controller  : 'FiscalController as FiscalCtrl',
        templateUrl : 'modules/fiscal/fiscal.html',
        params      : {
          label : null,
        },
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
        data        : { label : null },
        params      : {
          id : { squash : true, value : null },
        },
      })
      .state('fiscal.openingBalance', {
        url         : '/:id/opening_balance',
        controller  : 'FiscalOpeningBalanceController as FiscalOBCtrl',
        templateUrl : 'modules/fiscal/fiscal.openingBalance.html',
        data        : { label : null },
        params      : {
          id : { squash : true, value : null },
        },
      })
      .state('fiscal.closingBalance', {
        url         : '/:id/closing_balance',
        controller  : 'FiscalClosingBalanceController as FiscalCBCtrl',
        templateUrl : 'modules/fiscal/fiscal.closingBalance.html',
        data        : { label : null },
        params      : {
          id : { squash : true, value : null },
        },
      });
  }]);
