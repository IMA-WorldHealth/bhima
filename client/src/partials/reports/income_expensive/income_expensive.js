angular.module('bhima.controllers')
.controller('reportIncomeExpensive', [
  '$scope',
  '$q',
  'connect',
  'appstate',
  function ($scope, $q, connect, appstate) {

    //variables

    $scope.models = {};
    $scope.today = new Date();
    var incomeExpensiveStatements, periods;
    var names = ['accounts', 'periods', 'fys'];

    //fonctions

    function init(records) {
      //async function
      $scope.models[names[0]] = records[0];
      $scope.models[names[1]] = records[1].data;
      $scope.models[names[2]] = records[2].data;
      incomeExpensiveStatements = records[3];

      //sync function
      initializeItem();
      transformAccountNumber();
      setStatAccount();
    }

    function transformAccountNumber() {
      $scope.models.accounts.map(function(item) {
        item.number = item.number.toString();
      });
    }

    var getStatements = function (fiscal_id) {
      var def = $q.defer();
      connect.fetch('/reports/accountStatement/?'+JSON.stringify({fiscal_id : fiscal_id}))
      .then(function(values) {
        def.resolve(values);
      });
      return def.promise;
    };

    var getIncomeExpensiveAccount = function (enterprise_id) {
      var def = $q.defer();
      connect.fetch('/InExAccounts/'+enterprise_id+'/')
      .then(function(values) {
        def.resolve(values);
      });
      return def.promise;
    };

    function setStatAccount () {
      $scope.models.accounts.map(function(account) {
        if (account.parent === 0) {
          account.stat = [];
        }else{
          account.stat = getPeriodStats(account.id);
        }
      });
    }

    function getPeriodStats (account_id) {
      var periodStats = [];
      $scope.models.periods.forEach(function (period) {
        var balance = 0;
        incomeExpensiveStatements.forEach(function (incomeExpensiveStatements) {
          if (incomeExpensiveStatements.period_id === period.id && incomeExpensiveStatements.id === account_id) {
            balance+=(incomeExpensiveStatements.debit - incomeExpensiveStatements.credit);
          }
        });
        periodStats.push(balance);
      });
      return periodStats;
    }

    var loading = function (fy) {
      appstate.register('fiscal', function(fiscal) {
        $scope.fySelected = fy || fiscal;
        periods = {tables:{'period':{columns:['id', 'period_start', 'period_stop']}}, where : ['period.fiscal_year_id='+$scope.fySelected.id]};
        var fiscalYears = {
          tables:{
            'fiscal_year':{
              columns:['id', 'fiscal_year_txt', 'start_month', 'start_year', 'previous_fiscal_year', 'enterprise_id']
            }
          },
          where : ['fiscal_year.enterprise_id='+$scope.fySelected.enterprise_id]
        };
        $q.all([getIncomeExpensiveAccount($scope.fySelected.enterprise_id), connect.req(periods), connect.req(fiscalYears), getStatements($scope.fySelected.id)]).then(init);
      });
    };

    function initializeItem() {
      $scope.models.fys.map(function(item) {
        item.checked = false;
      });

      $scope.models.periods.map(function(item) {
        item.checked = true;
      });
    }

    var removePeriod = function(id) {
      var periods = [];
      $scope.models.periods.forEach(function(period) {
        if (period.id !== id) { periods.push(period); }
      });
      $scope.models.periods = periods;
      setStatAccount();
    };

    var tester = function() {
      loading($scope.choix || null);
    };

    $scope.reload = function(f) {
      f.checked = !f.checked;
      loading(f);
    };

    $scope.adjust = function(p) {
      p.checked = !p.checked;
      removePeriod(p.id);
      // $scope.models.periods.splice($scope.models.periods.indexOf(p), $scope.models.periods.indexOf(p)); dont work very well
    };

    // invocation
    tester();
  }
]);
