angular.module('bhima.routes')
  .config(['$stateProvider', function ($stateProvider) {

    $stateProvider
      .state('cashPaymentRegistry', {
        url : '/finance/reports/cash_payment',
        controller: 'CashPaymentRegistryController as CPRCtrl',
        templateUrl: 'partials/finance/reports/cash_payment/cash_payment.html'
      });

  }]);
