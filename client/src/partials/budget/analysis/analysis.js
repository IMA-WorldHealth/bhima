angular.module('bhima.controllers')
.controller('AnalysisBudgetController', AnalysisBudgetController);

AnalysisBudgetController.$inject = [
  '$q', '$window', '$translate', 'validate', 'precision', 'messenger',
  'SessionService', 'util', 'exportFile'
];

/**
*  Analysis Budget Controller
*  Ce controlleur est responsable de fournir un apercu du budget de l'entreprise
*  selon une annee fiscale choisie, on peut voir aussi les budgets precedants.
*  Les donnees budgetaires affichees peuvent etre exportE au format CSV pour un traitement ulterieur
*  par un responable de budget.
*/
function AnalysisBudgetController($q, $window, $translate, validate, precision, messenger, SessionService, util, exportFile) {
  var vm = this,
      dependencies = {},
      session = vm.session = {},
      config = vm.config = {};

  // Set up session defaults
  session.mode = 'configuration';
  session.periods = null;
  session.selectedPreviousFY = null;

  vm.months = {
    0 : 'OPERATING_ACCOUNT.ALL',
    1 : 'OPERATING_ACCOUNT.JANUARY',
    2 : 'OPERATING_ACCOUNT.FEBRUARY',
    3 : 'OPERATING_ACCOUNT.MARCH',
    4 : 'OPERATING_ACCOUNT.APRIL',
    5 : 'OPERATING_ACCOUNT.MAY',
    6 : 'OPERATING_ACCOUNT.JUNE',
    7 : 'OPERATING_ACCOUNT.JULY',
    8 : 'OPERATING_ACCOUNT.AUGUST',
    9 : 'OPERATING_ACCOUNT.SEPTEMBER',
    10 : 'OPERATING_ACCOUNT.OCTOBER',
    11 : 'OPERATING_ACCOUNT.NOVEMBER',
    12 : 'OPERATING_ACCOUNT.DECEMBER'
  };
  vm.total = {};
  vm.previousFY = {};

  dependencies.accounts = {};
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

  // Expose to the view
  vm.displayAccounts = displayAccounts;
  vm.exportToCSV = exportToCSV;
  vm.print = printer;
  vm.loadPeriod = loadPeriod;
  vm.formatFiscalYear = formatFiscalYear;
  vm.formatPeriod = formatPeriod;
  vm.budgetAnalysis = budgetAnalysis;
  vm.reconfigure = reconfigure;
  vm.togglePreviousFY = togglePreviousFY;
  vm.deselectAllFY = deselectAllFY;

  // Startup
  init();

  // Functions
  function init() {
    vm.enterprise = SessionService.enterprise;
    dependencies.fiscal_years.query.where = [ 'fiscal_year.enterprise_id=' + vm.enterprise.id ];
    validate.process(dependencies, ['fiscal_years'])
    .then(loadFiscalYears);
  }

  function addBudgetData() {
    // Insert the budget numbers into the account data
    // TODO: The following procedural hacks can be simplified by better SQL queries...
    // First compute the totals for any accounts with budgets
    var totalBudget = 0.0;
    var totalBalance = 0.0;
    var totals = {};
    vm.budgets.data.forEach(function (bud) {
      if (totals[bud.account_id]) {
        totals[bud.account_id] += bud.budget;
      }
      else {
        totals[bud.account_id] = bud.budget;
      }
      totalBudget += bud.budget;
    });

    var accounts_data_id = [];
    vm.accounts.data.forEach(function (acct) {
      accounts_data_id.push(acct.id);
    });

    // Previous Budgets processing
    // Total budget per fiscal year
    var totalsFY = {},
        totalBudgetFY = {};
    session.selectedPreviousFY.forEach(function (fy) {
      totalsFY[fy.id] = {};
      totalBudgetFY[fy.id] = 0.0;
      vm.fiscalYearBudget[fy.id].forEach(function (bud) {
        if (totalsFY[fy.id][bud.account_id]) {
          totalsFY[fy.id][bud.account_id] += bud.budget;
        }
        else {
          totalsFY[fy.id][bud.account_id] = bud.budget;
        }
        if (accounts_data_id.indexOf(bud.account_id) !== -1) {
          totalBudgetFY[fy.id] += bud.budget;
        }
      });
    });


    // Insert the budget totals into the account data
    vm.accounts.data.forEach(function (acct) {
      // Current budget
      if (totals[acct.id]) {
        acct.budget = precision.round(totals[acct.id], 2);
      } else {
        if (acct.type === 'title') {
          acct.budget = null;
        } else {
          acct.budget = 0; // No budget means 0 budget!
        }
      }

      // Previous Budgets
      acct.previousBudget = {};
      session.selectedPreviousFY.forEach(function (fy) {
        if (totalsFY[fy.id][acct.id]) {
          acct.previousBudget[fy.id] = precision.round(totalsFY[fy.id][acct.id], 2);
        } else {
          if (acct.type === 'title') {
            acct.previousBudget[fy.id] = null;
          } else {
            acct.previousBudget[fy.id] = 0; // No budget means 0 budget!
          }
        }
      });

      // Increment total balance
      if (!isNaN(acct.balance)) {
        totalBalance += acct.balance;
      }
    });

    vm.total.budget = precision.round(totalBudget, 2);
    vm.total.balance = precision.round(totalBalance, 2);
    // Previous Budget Data
    vm.totalPreviousBudget = {};
    session.selectedPreviousFY.forEach(function (fy) {
      vm.totalPreviousBudget[fy.id] = Math.round(totalBudgetFY[fy.id], 2);
    });
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

      parent = accountModel.get(account.parent);
      depth = 0;
      while (parent) {
        depth += 1;
        parent = accountModel.get(parent.parent);
      }
      account.depth = depth;
    });
    vm.total.surplus = precision.round(totalSurplus);
    vm.total.deficit = precision.round(totalDeficit);
  }

  function start(models) {
    angular.extend(vm, models);
    vm.accounts.data.forEach(function (acct) {
      if ((acct.type !== 'title') && (acct.balance === null)) {
        acct.balance = 0.0;
      }
    });

    filterAccounts(vm.accounts.data);
    addBudgetData();
    parseAccountDepth(vm.accounts.data, vm.accounts);
    session.mode = 'budget-analysis';
  }

  function displayAccounts() {
    dependencies.accounts.query = '/InExAccounts/' + vm.enterprise.id;
    // Process period
    var periodCriteria;
    var selectedPeriod = session.periods.filter(function (p) {
      return p.id == config.period_id;
    })[0];
    if (selectedPeriod){
      dependencies.budgets.query.where = ['period.fiscal_year_id=' + config.fiscal_year_id, 'AND', 'period.id='+selectedPeriod.id];
    } else {
      dependencies.budgets.query.where = ['period.fiscal_year_id=' + config.fiscal_year_id];
    }
    validate.refresh(dependencies, ['accounts', 'budgets'])
    .then(start);
  }

  function previousFYBudget(selectedPreviousFY) {
    // Get budget data for all previous fiscal years
    vm.fiscalYearBudget = {};
    for(var fy in selectedPreviousFY) {
      var budget = {
        id           : selectedPreviousFY[fy].id,
        data         : null,
        totalBudget  : 0,
        totalBalance : 0
      };
      vm.fiscalYearBudget[budget.id] = {};
      getBudget(budget.id);
    }

    function getBudget(fiscal_year_id) {
      // Work with a copy of dependencies.budgets structure
      // for a temporary previous fiscal years budgets
      dependencies.previousFYBudget = dependencies.budgets;
      // Process period
      var periodCriteria;
      var selectedPeriod = session.periods.filter(function (p) {
        return p.id == config.period_id;
      })[0];
      if (selectedPeriod) {
        dependencies.previousFYBudget.query.where = ['period.fiscal_year_id=' + fiscal_year_id, 'AND', 'period.period_number='+selectedPeriod.period_number];
      } else {
        dependencies.previousFYBudget.query.where = ['period.fiscal_year_id=' + fiscal_year_id];
      }
      validate.refresh(dependencies, ['previousFYBudget'])
      .then(function (model) {
        var data = model.previousFYBudget.data;
        handleFiscalYearBudget(fiscal_year_id, data);
      });
    }

    function handleFiscalYearBudget(fiscal_year_id, data) {
      vm.fiscalYearBudget[fiscal_year_id] = data;
    }
  }

  function loadFiscalYears(models) {
    angular.extend(vm, models);
  }

  function loadPeriod(fiscal_year_id) {
    dependencies.period = {
      query : {
        tables : {
          'period' : { columns : ['id', 'period_number', 'period_start', 'period_stop'] }
        },
        where : ['period.fiscal_year_id=' + fiscal_year_id, 'AND', 'period.period_number<>0']
      }
    };

    validate.refresh(dependencies, ['period'])
    .then(function (model) {
      session.periods = model.period.data;
      loadPreviousFiscalYears(fiscal_year_id);
    });
  }

  function loadPreviousFiscalYears(fiscal_year_id) {
    session.previous_fiscal_years = [];
    var current = vm.fiscal_years.get(fiscal_year_id);
    if (current.previous_fiscal_year) {
      session.previous_fiscal_years = vm.fiscal_years.data.filter(function (fy) {
        var currentDate = new Date(current.start_year, current.start_month, 1);
        var otherDate = new Date(fy.start_year, fy.start_month, 1);
        return (currentDate > otherDate) ? true : false;
      });
    }
  }

  function budgetAnalysis() {

    if (config.fiscal_year_id && config.period_id) {
      var selectedPeriod = session.periods.filter(function (p) {
        return p.id == config.period_id;
      })[0];
      session.selectedPeriod = selectedPeriod ? $translate.instant(vm.months[selectedPeriod.period_number]) : $translate.instant(vm.months[0]);
      session.selectedFiscalYear = vm.fiscal_years.get(config.fiscal_year_id);
      getSelectPreviousFY()
      .then(previousFYBudget)
      .then(displayAccounts);
    }

    function getSelectPreviousFY() {
      var def = $q.defer();
      session.selectedPreviousFY = session.previous_fiscal_years.filter(function(fy) {
        return fy.checked;
      });
      def.resolve(session.selectedPreviousFY);
      return def.promise;
    }
  }

  function exportToCSV() {
    var fileData = {
      column: ['AccountId', 'AccountNum', 'AccountName', 'Budget', 'Balance', 'Gap Surplus', 'Gap Deficit'],
      data: []
    };

    // Get previous fy labels
    var previousLabels = [];
    session.selectedPreviousFY.forEach(function (fy) {
      previousLabels.push(fy.fiscal_year_txt);
    });
    previousLabels.push('Type');
    fileData.column = fileData.column.concat(previousLabels);

    vm.accounts.data.forEach(function (a) {
      var budget = a.budget === null ? '' : a.budget;
      var balance = a.balance === null ? '' : a.balance;

      // Get previous fy budget data
      var previousBudget = [];
      session.selectedPreviousFY.forEach(function (fy) {
        var prevBudget = a.previousBudget[fy.id] === null ? '' : a.previousBudget[fy.id];
        previousBudget.push(prevBudget);
      });

      var row = [a.id, a.number, a.label, budget, balance, a.surplus, a.deficit].concat(previousBudget, a.type);
      fileData.data.push(row);
    });

    // Exportation
    var labelPeriod     = session.selectedPeriod || '';
    var labelFiscalYear = session.selectedFiscalYear.start_year || '';
    exportFile.csv(fileData, 'Budget ' + labelPeriod + '_' + labelFiscalYear);
  }

  function reconfigure() {
    session.mode = 'configuration';
  }

  function printer() {
    $window.print();
  }

  function formatFiscalYear(obj) {
    return '' + obj.fiscal_year_txt + ' - ' + obj.start_month + '/' + obj.start_year;
  }

  function formatPeriod(obj) {
    return '' + $translate.instant(vm.months[obj.period_number]);
  }

  function filterAccounts(model) {
    var accountClass = config.account_class || 0,
        expense = ''+ $translate.instant('BUDGET.ANALYSIS.EXPENSE'),
        income = ''+ $translate.instant('BUDGET.ANALYSIS.INCOME');

    if (accountClass === 6 || accountClass === expense) {
      // Class 6 accounts
      vm.accounts.data = model.filter(function (acct) {
        return acct.classe === 6 || acct.classe === '6';
      });
    } else if (accountClass === 7 || accountClass === income) {
      // Class 7 accounts
      vm.accounts.data = model.filter(function (acct) {
        return acct.classe === 7 || acct.classe === '7';
      });
    }
  }

  function togglePreviousFY(bool) {
    session.previous_fiscal_years.forEach(function (fy) {
      fy.checked = bool;
    });
  }

  function deselectAllFY(bool) {
    if (!bool) { vm.previousFY.all = false; }
  }

}
