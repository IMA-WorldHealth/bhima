angular.module('bhima.controllers')
.controller('report.transactions.account', ReportAccountTransactionsController);

ReportAccountTransactionsController.$inject = [
  '$scope', '$window', 'validate', 'connect', 'appstate', 'exchange', 'SessionService'
];

/**
* This report presents all transactions hitting a given account.
*/
function ReportAccountTransactionsController($scope, $window, validate, connect, appstate, exchange, Session) {
  var session = $scope.session = {},
      dependencies = {},
      state = $scope.state;

  dependencies.accounts = {
    query : {
      tables : {
        'account' : {
          columns : ['id', 'account_number', 'account_txt']
        }
      }
    }
  };

  dependencies.currencies = {
    required : true,
    query : {
      tables : {
        'currency' : {
          columns : ['id', 'symbol']
        }
      }
    }
  };

  session.timestamp = new Date();
  $scope.enterprise = Session.enterprise;
  session.currency = $scope.enterprise.currency_id;
  session.limits = [10, 25, 50, 75, 100, 500, 1000, 5000, 10000];
  session.loading = false;

  function startup(models) {
    $scope.currencies = models.currencies;
    session.currency = Session.enterprise.currency_id;
    models.accounts.data.forEach(function (acc) {
      acc.account_number = String(acc.account_number);
    });
    session.limit = 10;
    angular.extend($scope, models);
  }

  validate.process(dependencies)
  .then(startup);

  $scope.search = function search() {
    $scope.state = 'generate';

    if (!session.account || !session.limit) { return; }

    // make sure to purge old data
    if ($scope.transactions) { $scope.transactions.length = 0; }

    var query = '?account=' + session.account.id +
                '&limit=' + session.limit;

    session.loading = true;

    connect.fetch('/reports/transactions/' + query)
    .then(function (data) {
      $scope.transactions = data;
      convert();
    })
    .finally(function () { session.loading = false; });
  };

  $scope.print = function print() {
    $window.print();
  };

 function reconfigure() {
    $scope.state = null;
    $scope.session.account = null;
    $scope.session.limit = null;
  }

  function convert() {
    if ($scope.transactions) {
      session.sum_debit = 0;
      session.sum_credit = 0;
      $scope.transactions.forEach(function (transaction) {
        session.sum_debit += exchange.convertir(transaction.debit, transaction.currency_id, session.currency,new Date());
        session.sum_credit += exchange.convertir(transaction.credit, transaction.currency_id, session.currency,new Date());
      });
    }
  }

  $scope.convert = convert;
  $scope.reconfigure = reconfigure;
}
