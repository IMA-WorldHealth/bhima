angular.module('bhima.controllers')
.controller('ReportChartOfAccountsController', ReportChartOfAccountsController);

ReportChartOfAccountsController.$inject = [
  '$scope', '$window', '$translate', 'validate', 'SessionService'
];

function ReportChartOfAccountsController($scope, $window, $translate, validate, Session) {
  var dependencies = {},
      session = $scope.session = {};

  $scope.enterprise =  Session.enterprise;
  session.loading = false;

  function accountsReport(model) {
    $scope.timestamp = new Date();

    $scope.model = model;
    sortAccounts($scope.model.account);
    parseAccountDepth($scope.model.account.data, $scope.model.account);
  }

  function sortAccounts(accountModel) {
    var data = accountModel.data;

    data.sort(function (a, b) {
      var left = String(a.account_number), right = String(b.account_number);
      return (left === right) ? 0 : (left > right ? 1 : -1);
    });

    accountModel.recalculateIndex();
  }

  function parseAccountDepth(accountData, accountModel) {
    accountData.forEach(function (account) {
      var parent, depth = 0;

      //TODO if parent.depth exists, increment and kill the loop (base case is ROOT_NODE)
      parent = accountModel.get(account.parent);
      depth = 0;
      while (parent) {
        depth += 1;
        parent = accountModel.get(parent.parent);
      }
      account.depth = depth;
    });
  }

  // this fn sends the HTTP requests
  function search() {
    session.loading = true;

    dependencies.account = {
      query: {
        tables: {
          'account': {
            columns: ['id', 'account_type_id', 'account_txt', 'account_number', 'is_ohada']
          }
        },
        where : ['account.is_ohada=' + session.type]
      }
    };

    session.type = parseInt(session.type);

    if(session.type === 1){
      $scope.title = $translate.instant('COLUMNS.OHADA');
    } else if (session.type === 0) {
      $scope.title = $translate.instant('COLUMNS.PCGC');
    }

    $scope.state = 'generate';

    validate.process(dependencies)
    .then(accountsReport)
    .finally(function () {
      session.loading = false;
    });

  }

  function reconfigure () {
    $scope.state = null;
    $scope.session.type = null;
    $scope.session.limit = null;
    $scope.model = null;
  }

  $scope.print = function () { $window.print(); };
  $scope.reconfigure = reconfigure;
  $scope.search = search;
}
