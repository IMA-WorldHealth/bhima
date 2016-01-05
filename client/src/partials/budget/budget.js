angular.module('bhima.controllers')
.controller('budget', [
  '$scope', 
  '$window',
  '$http',
  '$translate',
  'validate',
  'precision',
  'messenger',
  'appstate',
  function($scope, $window, $http, $translate, validate, precision, messenger, appstate) {
    var dependencies = {},
        enterprise_id = null,
        session = $scope.session = {};


    // Set up session defaults
    session.mode = 'select';
    session.fiscal_year = null;

    $scope.timestamp = new Date();
    $scope.total = {};
    // Define the database queries
    dependencies.accounts = {
    };

    // TODO: Convert this into a server-side get query that does totals
    // NOTE: No need to restrict this to income/expense since budgets are
    //       never added to anything else.
    dependencies.budgets = {
      query : {
        tables : {
          'budget' : { 
            columns : ['id', 'account_id', 'period_id', 'budget']
            },
          'period' : {
            columns : ['fiscal_year_id', 'period_number', 'period_start', 'period_stop', 'locked' ]
            }
          },
        join : [ 'period.id=budget.period_id' ]
        }
    };

    dependencies.fiscal_years = {
      query : {
        tables : {
          'fiscal_year' : {
            columns : ['id', 'fiscal_year_txt', 'start_month', 'start_year', 'previous_fiscal_year']
          },
        },
  orderby : ['fiscal_year.start_year', 'fiscal_year.start_month'],
      }
    };

    function addBudgetData() {
      // Insert the budget numbers into the account data
      // TODO: The following procedural hacks can be simplified by better SQL queries...
      // First compute the totals for any accounts with budgets
      var totalBudget = 0.0;
      var totalBalance = 0.0;
      var totals = {};
      $scope.budgets.data.forEach(function (bud) {
      if (bud.account_id in totals) {
        totals[bud.account_id] += bud.budget;
      }
      else {
        totals[bud.account_id] = bud.budget;
      }
      totalBudget += bud.budget;
    });

      // Insert the budget totals into the account data
      $scope.accounts.data.forEach(function (acct) {
        if (acct.id in totals) {
          acct.budget = precision.round(totals[acct.id], 2);
        } else {
          if (acct.type === 'title') {
            acct.budget = null;
          } else {
            acct.budget = 0; // No budget means 0 budget!
          }
        }
        // Increment total balance
        if (!isNaN(acct.balance)) {
          totalBalance += acct.balance;
        }
      });

      $scope.total.budget = precision.round(totalBudget, 2);
      $scope.total.balance = precision.round(totalBalance, 2);
    }

    function parseAccountDepth(accountData, accountModel) {
      // Copied from chart of accounts, should refactor surplus deficit
      var totalSurplus = 0.0,
        totalDeficit = 0.0;

      accountData.forEach(function (account) {
        var parent, depth = 0;
        if(account.classe === 6 || account.classe === 2){
          if(account.budget > account.balance) {
            account.surplus = account.budget - account.balance;
            account.deficit = 0;
          } else if (account.budget < account.balance) {
            account.deficit = account.balance - account.budget;
            account.surplus = 0;
          } else {
            account.deficit = 0;
            account.surplus = 0;
          }
        } else if(account.classe === 7 || account.classe === 1 || account.classe === 5){
          if(account.budget < account.balance) {
            account.surplus = account.balance - account.budget ;
            account.deficit = 0;
          } else if (account.budget > account.balance) {
            account.deficit = account.budget - account.balance;
            account.surplus = 0;
          } else {
            account.deficit = 0;
            account.surplus = 0;
          }
        }
        totalSurplus += account.surplus;
        totalDeficit += account.deficit;  

        //TODO if parent.depth exists, increment and kill the loop (base case is ROOT_NODE)
        parent = accountModel.get(account.parent);
        depth = 0;
        while (parent) {
          depth += 1;
          parent = accountModel.get(parent.parent);
        }
        account.depth = depth;
      });
      $scope.total.surplus = precision.round(totalSurplus);
      $scope.total.deficit = precision.round(totalDeficit);  
    }

    function start(models) {
      angular.extend($scope, models);
      $scope.accounts.data.forEach(function (acct) {
      if ((acct.type !== 'title') && (acct.balance === null)) {
        acct.balance = 0.0;
      }
    });
      addBudgetData();
      parseAccountDepth($scope.accounts.data, $scope.accounts);
      session.mode = 'display';
    }

    function displayAccounts() {
      dependencies.accounts.query = '/InExAccounts/' +enterprise_id;
      dependencies.budgets.query.where = ['period.fiscal_year_id=' + session.fiscal_year.id];
      validate.refresh(dependencies, ['accounts', 'budgets'])
      .then(start);
    }

    function selectYear(id) {
      session.fiscal_year = $scope.fiscal_years.data.filter(function (obj) {
      return obj.id === id;
      })[0];
    }

    function loadFiscalYears(models) {
      angular.extend($scope, models);
      // Default to the last fiscal year
      session.fiscal_year = $scope.fiscal_years.data[$scope.fiscal_years.data.length - 1];
    }

    // Register this controller
    appstate.register('enterprise', function (enterprise) {
      enterprise_id = Number(enterprise.id);
      $scope.enterprise = enterprise;
      dependencies.fiscal_years.query.where = [ 'fiscal_year.enterprise_id=' + enterprise_id ];
      validate.process(dependencies, ['fiscal_years'])
        .then(loadFiscalYears);
    });

    function exportToCSV() {
      // Construct the raw CSV string with the account budget/balance data
      var lf = '%0A';
      var sp = '%20';
      var csvStr = '"AccountId", "AccountNum", "AccountName", "Budget", "Balance", "Gap Surplus", "Gap Deficit", "Type"' + lf;
      $scope.accounts.data.forEach(function (a) {
      var budget = a.budget;
      if (budget === null) {
        budget = '';
        }
      var balance = a.balance;
      if (balance === null) {
        balance = '';
      }
      var title = a.account_txt.replace(/"/g, '\'').replace(/ /g, sp);
      csvStr += a.id + ', ' + a.account_number + ', "' + title + '", ' + budget + ', ' + balance + ', ' + a.surplus + ', ' + a.deficit + ', "' + a.type + '"' + lf;
      });

      var today = new Date();
      var date = today.toISOString().slice(0, 19).replace('T', '-').replace(':', '-').replace(':', '-');
      var path = 'budget-' + date + '.csv';

      // Construct a HTML 'download' element to download the CSV data (at the end of the body)
      var e         = document.createElement('a');
      e.href        = 'data:attachment/csv,' + csvStr;
      e.className   = 'no-print';
      e.target      = '_blank';
      e.download    = path;
      document.body.appendChild(e);
      e.click();
    }

    function selectFiscalYear() {
      session.mode = 'select';
    }

    function print() {
      $window.print();
    }

    // Set up the exported functions
    $scope.selectYear = selectYear;
    $scope.displayAccounts = displayAccounts;
    $scope.selectFiscalYear = selectFiscalYear;
    $scope.exportToCSV = exportToCSV;
    $scope.print = print;

}]);
