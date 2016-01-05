angular.module('bhima.controllers')
.controller('NewBudgetController', NewBudgetController);

NewBudgetController.$inject = [
  '$q', '$scope', '$http', '$translate', 'validate', 'precision', 'messenger',
  'SessionService', 'connect', 'Upload'
];

/**
*  New Budget Controller
*  This controller is responsible for creating a new budget by importing a csv file or individually by account
*  The csv file imported is is a file which already has been processed by an accountant
*/
function NewBudgetController($q, $scope, $http, $translate, validate, precision, messenger, SessionService, connect, Upload) {
  var dependencies = {},
      session = $scope.session = {},
      config = $scope.config = {};

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
    join  : [ 'period.id=budget.period_id' ],
    where : [ 'period.period_number<>0' ]
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
      orderby: ['fiscal_year.start_year', 'fiscal_year.start_month']
    }
  };

  session.option = 'csv';

  // Startup
  init();

  // Functions
  function init() {
    $scope.enterprise = SessionService.enterprise;
    dependencies.fiscal_years.query.where = [ 'fiscal_year.enterprise_id=' + $scope.enterprise.id ];
    validate.process(dependencies, ['fiscal_years'])
    .then(loadFiscalYears);
  }

  /* -------------------------------------------------- */

  /* ================== */
  /* ULPOADING CSV FILE */
  /* ================== */

  // Initialize the session
  $scope.months = {
    0  : 'OPERATING_ACCOUNT.ALL',
    1  : 'OPERATING_ACCOUNT.JANUARY',
    2  : 'OPERATING_ACCOUNT.FEBRUARY',
    3  : 'OPERATING_ACCOUNT.MARCH',
    4  : 'OPERATING_ACCOUNT.APRIL',
    5  : 'OPERATING_ACCOUNT.MAY',
    6  : 'OPERATING_ACCOUNT.JUNE',
    7  : 'OPERATING_ACCOUNT.JULY',
    8  : 'OPERATING_ACCOUNT.AUGUST',
    9  : 'OPERATING_ACCOUNT.SEPTEMBER',
    10 : 'OPERATING_ACCOUNT.OCTOBER',
    11 : 'OPERATING_ACCOUNT.NOVEMBER',
    12 : 'OPERATING_ACCOUNT.DECEMBER'
  };
  session.periods  = null;
  session.file     = null;
  session.csvArray = null;

  // Expose to view
  $scope.uploadFile = uploadFile;
  $scope.formatPeriod = formatPeriod;

  // Functions
  function uploadFile(file) {
    session.file = file;
    Upload.upload({ url: '/budget/upload',
      file: file,
      fields : {
        'fiscal_year_id' : config.fiscal_year_id,
        'period' : config.period,
      }
    })
    .then(function () {
      messenger.success($translate.instant('UTIL.SUCCESS'), true);
      config.period = null;
    })
    .catch(function () {
      messenger.error($translate.instant('ERROR.ERR_UPLOAD'), true);
      config.period = null;
    });
  }

  function loadPeriod(fiscal_year_id) {
    dependencies.periods.query.where = ['period.fiscal_year_id=' + fiscal_year_id, 'AND', 'period.id<>0'];

    validate.refresh(dependencies, ['periods'])
    .then(function (model) {
      session.periods = model.periods.data;
    });
  }

  function formatPeriod(obj) {
    return '' + $translate.instant($scope.months[obj.period_number]);
  }

  /* ====================== */
  /* END ULPOADING CSV FILE */
  /* ====================== */

  /* -------------------------------------------------- */

  /* =============== */
  /* BUDGET MANUALLY */
  /* =============== */

  // Initialize the session
  session.mode        = 'configure';
  session.found       = false;
  session.account     = null;
  session.fiscal_year = null;
  session.numPeriods  = null;
  session.totalBudget = 0.0;
  session.validTotal  = false;
  session.autoAdjust  = false;
  session.no_data_msg = null;

  // Expose to view
  $scope.submitAccount      = submitAccount;
  $scope.createBudget       = createBudget;
  $scope.accountWhere       = accountWhere;
  $scope.restartSearch      = restartSearch;
  $scope.updateBudget       = updateBudget;
  $scope.toggleFreeze       = toggleFreeze;
  $scope.startEditing       = startEditing;
  $scope.endEditing         = endEditing;
  $scope.recompute          = recompute;
  $scope.formatFiscalYear   = formatFiscalYear;
  $scope.selectFiscalYear   = selectFiscalYear;

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
      //  NOTE: Restricting the periods to the selected fiscal year
      //  automatically limits the budget items to ones for this
      //  enterprise since the specific FY is tied to a particular
      //  enterprise.
      dependencies.periods.query.where = ['period.fiscal_year_id=' + session.fiscal_year.id, 'AND',
      'period.period_number<>0'];
      validate.refresh(dependencies, ['account', 'budgets', 'periods'])
      .then(startup);
      session.mode = 'edit';
    }
  }

  function accountWhere() {
    // only unlocked income/expense accounts
    // Allow accounts of class 1 and 2 used in budget
    return [['account.account_type_id IN (1,4)','OR',['account.classe IN (1,2,5)','AND','account.is_used_budget=1']], 'AND', 'account.locked=0' ];
  }

  function restartSearch() {
    session.mode = 'configure';
    session.option = 'manual';
    session.autoAdjust = false;
  }

  function createBudget() {
    var newBudgets = [];
    $scope.periods.data.forEach(function (per, index) {
    newBudgets.push({
      'account_id' : session.account.id,
      'period_id'  : per.id,
      'budget'     : 0.0});
    });

    connect.post('budget', newBudgets)
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
    $http.post('/budget/update', {
      params : {
        budgets   : $scope.budgets.data,
        accountId : session.account.id
      }
    })
    .then(function () {
      messenger.success($translate.instant('BUDGET.EDIT.UPDATE_OK'));
      submitAccount(session.account);
      session.autoAdjust = false;
    })
    .catch(function (err) {
      messenger.danger($translate.instant('BUDGET.EDIT.UPDATE_FAIL'));
      console.log(err);
    });
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
          totalFree   = 0.0,  // Total budget that is NOT frozen/editing on the form
          numFree     = 0;    // Number of budgets that are not frozen/editing on the form

      // First figure out how much is free
      $scope.budgets.data.forEach(function (bud) {
        if (bud.freeze || bud.editing) {
          totalFrozen += bud.budget;
        }
        else {
          totalFree += bud.budget;
          numFree++;
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
    var total = $scope.budgets.data.reduce(sumBudget, 0.0);

    if (isNaN(session.totalBudget) || session.totalBudget === null ||
      isNaN(total) || total === null) {
      // Make sure we have real numbers
      session.validTotal = false;
    } else {
      session.validTotal = precision.round(total, 6) === precision.round(session.totalBudget, 6);
    }
  }

  function sumBudget(a, b) {
    return a + b.budget;
  }

  function loadFiscalYears(models) {
    angular.extend($scope, models);
    // Default to the last fiscal year
    var numFY = $scope.fiscal_years.data.length;
    session.fiscal_year = numFY ? $scope.fiscal_years.data[numFY - 1] : null;
  }

  function selectFiscalYear(fy_id) {
    session.fiscal_year = $scope.fiscal_years.get(fy_id);
    loadPeriod(fy_id);
  }

  function formatFiscalYear(fy) {
    return '' + fy.fiscal_year_txt + ' (' + fy.start_month + '/' + fy.start_year + ')';
  }

  /* =================== */
  /* END BUDGET MANUALLY */
  /* =================== */
}
