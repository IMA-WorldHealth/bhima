angular.module('bhima.controllers')
.controller('accountStatement', ReportAccountStatement);

ReportAccountStatement.$inject = [
  '$scope', '$http', '$routeParams', '$translate', 'uuid', 'util',
  'messenger', '$window', 'validate', 'SessionService'
];

function ReportAccountStatement($scope, $http, $routeParams, $translate, uuid, util, messenger, $window, validate, Session) {
  var dependencies = {},
      state = $scope.state;

  $scope.project = Session.project;
  var session = $scope.session = {
    timestamp : new Date(),
    config : {
      limit : 10,
      accountId : null
    },
    select : false
  };

  session.loading = false;
  session.config.dateFrom = new Date();
  session.config.dateTo = new Date();

  dependencies.accounts = {
    query : {
      tables : {
        'account' :{
          columns : ['id', 'account_txt', 'account_number']
        }
      }
    }
  };

  validate.process(dependencies)
  .then(init)
  .catch(handleError);

  function init(models) {
    angular.extend(session, models);
  }

  // Define the callbacks for the findAccount dialog
  function submitAccount(account) {
    $scope.state = 'generate';

    fetchReport(account.id);
  }

  function resetAccountSearch() {
    session.config.accountId = null;
  }


  function handleError(err) {
    messenger.danger($translate.instant('REPORT.ACCOUNT_STATEMENT.CANNOT_FIND_ACCOUNT') + ' ' + session.requestId);
  }

  function fetchReport(accountId) {
    session.config.accountId = accountId;
    session.loading = true;
    processReport()
    .then(initialise)
    .catch(handleError)
    .finally(function () { session.loading = false; });
  }

  function processReport() {
    dependencies.report = {};
    var statementParams = {
      dateFrom : util.sqlDate(session.config.dateFrom),
      dateTo : util.sqlDate(session.config.dateTo),
      order : 'date',
      limit : angular.isNumber(session.config.limit)? session.config.limit : 10,
      accountId : session.config.accountId
    };

    dependencies.report.query =
      '/reports/accountStatement/?' +
      JSON.stringify(statementParams);
    return $http.get(dependencies.report.query);
  }

  function initialise(model) {
    $scope.report = model.data;
    $scope.report.uuid = uuid();
    console.log('$scope.report:', $scope.report);
  }

  $scope.print = function () { $window.print(); };

 function reconfigure () {
    $scope.state = null;
  }

  $scope.reconfigure = reconfigure;
  $scope.submitAccount = submitAccount;
  $scope.resetAccountSearch = resetAccountSearch;
}
