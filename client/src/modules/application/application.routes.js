angular.module('bhima.routes')
  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider
      .state('index', {
        url         : '/',
        controller  : 'HomeController as HomeCtrl',
        templateUrl : 'modules/home/home.html',
      })
      .state('landing', {
        abstract     : true,
        url          : '/landing',
        controller   : ['SessionService', function (Session) { this.enterprise = Session.enterprise; }],
        controllerAs : 'LandingCtrl',
        templateUrl  : 'modules/home/details.html',
      })
      .state('landing.stats', {
        url   : '/stats',
        views : {
          debtors : {
            templateUrl : 'modules/home/units/debtors.html',
            controller  : 'DashboardDebtorController as DebtorCtrl',
          },
          invoices : {
            templateUrl : 'modules/home/units/invoices.html',
            controller  : 'DashboardInvoiceController as InvoiceCtrl',
          },
          patients : {
            templateUrl : 'modules/home/units/patients.html',
            controller  : 'DashboardPatientController as PatientCtrl',
          },
        },
      })
      .state('exchange', {
        abstract    : true,
        url         : '/exchange',
        templateUrl : 'modules/application/exchange.html',
      })
      .state('exchange.index', {
        url   : '',
        views : {
          'exchange@exchange' : {
            templateUrl : 'modules/enterprises/exchange/exchange.html',
            controller  : 'ExchangeController as ExchangeCtrl',
          },
        },
      });
  }]);
