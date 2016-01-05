angular.module('bhima.controllers')
.controller('editAccountBudget', [
  '$scope',
  '$translate',
  '$q',
  'connect',
  'validate',
  'precision',
  'messenger',
  'appstate',
  function ($scope, $translate, $q, connect, validate, precision, messenger, appstate) { 
    var dependencies = {},
        enterprise_id = null,
        session = $scope.session = {};

    // Set up for the database queries
    dependencies.account = {
      query : {
        tables : {
          'account' :{
            columns : ['id', 'account_type_id', 'account_txt', 'account_number']
          },
          'account_type' : { 
            columns : ['type'] 
          },
        },
        join : ['account_type.id = account.account_type_id'],
        where : [ 'account.account_type_id in (1,4)' ]
      }
    };

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
      join : [ 'period.id=budget.period_id' ],
      }
    };

    dependencies.periods = {
      query : {
      tables : {
        'period' : {
          columns : ['id', 'fiscal_year_id', 'period_number', 'period_start', 'period_stop', 'locked' ]
        }
      },
      where : [ 'period.period_number<>0' ]
      }
    };

    dependencies.fiscal_years = {
      query : {
        tables : {
          'fiscal_year' : {
            columns : ['id', 'fiscal_year_txt', 'start_month', 'start_year', 'previous_fiscal_year']
          },
        },
        orderby: ['fiscal_year.start_year', 'fiscal_year.start_month'],
        limit: 2
      }
    };

    // Initialize the session
    session.mode = 'search';
    session.found = false;
    session.account = null;
    session.fiscal_year = null;
    session.numPeriods = null;
    session.totalBudget = 0.0;
    session.validTotal = false;
    session.autoAdjust = false;
    session.no_data_msg = null;

    // Basic setup function when the models are loaded
    function startup(models) {
      angular.extend($scope, models);

      session.found = models.budgets.data.length > 0;
      session.numPeriods = models.budgets.data.length;
      var total = 0.0;
      models.budgets.data.forEach(function (b) {
        b.freeze = false;
        b.editing = false;
        total += Number(b.budget);
      });
      session.totalBudget = total;

      if (session.found) {
        recompute();
      }
      else {
        session.no_data_msg = $translate.instant('BUDGET.EDIT.DATA_NOT_FOUND')
          .replace('(acct)', session.account.account_txt)
          .replace('(fyname)', session.fiscal_year.fiscal_year_txt);  
      }
    }

    // Initialize editing the selected account
    function submitAccount(newAccount) {
      if (newAccount) { 
        session.account = newAccount;
        dependencies.account.query.where = ['account.id=' + newAccount.id];
        dependencies.budgets.query.where = ['period.fiscal_year_id=' + session.fiscal_year.id, 'AND',
              'budget.account_id=' + session.account.id, 'AND',
              'period.fiscal_year_id=' + session.fiscal_year.id, 'AND',
              'period.period_number<>0'];
  // NOTE: Restricting the periods to the selected fiscal year
  //       automatically limits the budget items to ones for this
  //       enterprise since the specific FY is tied to a particular
  //       enterprise.
      dependencies.periods.query.where = ['period.fiscal_year_id=' + session.fiscal_year.id, 'AND',
      'period.period_number<>0'];
      validate.refresh(dependencies, ['account', 'budgets', 'periods'])
      .then(startup);
        session.mode = 'edit';
      }
    }

    function resetAccountSearch() {
      // NOP for now (may need it later)
    }

    // BUDGET: 
    //   `id` int not null auto_increment,
    //   `account_id` int unsigned not null default '0',
    //   `period_id` mediumint unsigned not null,
    //   `budget` decimal(10,4) unsigned,

    function createBudget() {
      var newBudgets = [];
      $scope.periods.data.forEach(function (per, index) {
      newBudgets.push({'account_id' : session.account.id,
       'period_id' : per.id,
       'budget' : 0.0});
      });

      connect.post('budget', newBudgets, ['id'])
      .then(function () {
        messenger.success($translate.instant('BUDGET.EDIT.CREATE_OK'));
        submitAccount(session.account);
      })
      .catch(function (err) {
      messenger.danger($translate.instant('BUDGET.EDIT.CREATE_FAIL'));
      console.log(err);
      });
    }

    function updateBudget() {
      // Save the budget data for all the periods
      var dbPromises = [];
      $scope.budgets.data.forEach(function (bud) {
      dbPromises.push( 
      connect.put('budget', 
        [{'id' : bud.id,
        'account_id' : session.account.id,
        'period_id' : bud.period_id,
        'budget' : precision.round(bud.budget, 4)}],
        ['id']));
      });

      $q.all(dbPromises)
      .then(function () {
        messenger.success($translate.instant('BUDGET.EDIT.UPDATE_OK'));
        submitAccount(session.account);
      })
      .catch(function (err) {
        messenger.danger($translate.instant('BUDGET.EDIT.UPDATE_FAIL'));
        console.log(err);
      });
    }

    function selectYear(id) {
      session.fiscal_year = $scope.fiscal_years.data.filter(function (obj) {
      return obj.id === id;
      })[0];
    }

    function accountWhere() {
      // only unlocked income/expense accounts
      // Allow accounts of class 1 and 2 used in budget
      return [['account.account_type_id IN (1,4)','OR',['account.classe IN (1,2,5)','AND','account.is_used_budget=1']], 'AND', 'account.locked=0' ];
    }

    function restartSearch() {
      session.mode = 'search';
      session.autoAdjust = false;
    }

    function toggleFreeze(budget) {
      budget.freeze = !budget.freeze;
    }

    function startEditing(budget) {
      budget.editing = true;
    }

    function endEditing(budget) {
      budget.editing = false;
    }

    function recompute() {
      if (session.autoAdjust) {
        var totalFrozen = 0.0,  // Total budget that is frozen/editing on the form
          totalFree = 0.0,    // Total budget that is NOT frozen/editing on the form
          numFree = 0;        // Number of budgets that are not frozen/editing on the form

    // First figure out how much is free
    $scope.budgets.data.forEach(function (bud) {
      if (bud.freeze || bud.editing) {
        totalFrozen += bud.budget;
      }
      else {
        totalFree += bud.budget;
        numFree += 1;
      }
    });

    totalFree = session.totalBudget - totalFrozen;

  // Redistribute
    if (numFree > 0) {
      $scope.budgets.data.forEach(function (bud) {
        if (!bud.freeze && !bud.editing) {
          bud.budget = totalFree / numFree;
        }
      });
      session.validTotal = true;
    }
  }

      // Double-check the totals
    var total = 0.0;
    $scope.budgets.data.forEach(function (bud) {
      total += bud.budget;
    });

    if (isNaN(session.totalBudget) || session.totalBudget === null ||
      isNaN(total) || total === null) {
    // Make sure we have real numbers
      session.validTotal = false;
    } else {
      session.validTotal = precision.round(total, 6) === precision.round(session.totalBudget, 6);
    }
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

    // Set up the visible functions
  $scope.submitAccount = submitAccount;
  $scope.resetAccountSearch = resetAccountSearch;

  $scope.selectYear = selectYear;
  $scope.createBudget = createBudget;
  $scope.accountWhere = accountWhere;
  $scope.restartSearch = restartSearch;
  $scope.updateBudget = updateBudget;
  $scope.toggleFreeze = toggleFreeze;
  $scope.startEditing = startEditing;
  $scope.endEditing = endEditing;
    $scope.recompute = recompute;
  }

]);
