angular.module('bhima.controllers')
.controller('cashFlowReportController', CashFlowReportController);

CashFlowReportController.$inject = [
  '$q', '$http', 'connect', 'validate', 'messenger', 'util', 'appcache',
  'exchange', 'SessionService', 'transactionSource', '$translate'
];

/**
  * Cash Flow Controller
  * This controller is responsible of cash flow report, that report include
  * all incomes minus all depenses
  */
function CashFlowReportController ($q, $http, connect, validate, messenger, util, Appcache, exchange, SessionService, transactionSource, $translate) {
  var vm = this,
      session = vm.session = {},
      dependencies = {},
      cache = new Appcache('income_report'),
      state = vm.state;

  session.dateFrom         = new Date();
  session.dateTo           = new Date();
  session.loading          = false;
  session.details          = false;
  session.summationIncome  = [];
  session.summationExpense = [];

  dependencies.cashes = {
    required: true,
    query : {
      tables : {
        'cash_box' : {
          columns : ['text', 'project_id']
        },
        'cash_box_account_currency' : {
          columns : ['id', 'currency_id', 'cash_box_id', 'account_id']
        },
        'currency' : {
          columns : ['symbol']
        }
      },
      join : [
        'cash_box.id=cash_box_account_currency.cash_box_id',
        'currency.id=cash_box_account_currency.currency_id'
      ]
    }
  };

  dependencies.cashflow = {};

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

  // Expose to the view
  vm.setSelectedCash = setSelectedCash;
  vm.fill            = fill;
  vm.convert         = convert;
  vm.reconfigure     = reconfigure;
  vm.getSource       = getSource;
  vm.showDetails     = showDetails;

  vm.print           = function () { print(); };

  cache.fetch('selectedCash').then(load);

  // Functions
  function load (selectedCash) {
    if (selectedCash) { session.selectedCash = selectedCash; }

    session.project = SessionService.project;
    dependencies.cashes.query.where = ['cash_box.project_id=' + session.project.id, 'AND', 'cash_box.is_auxillary=0'];
    validate.process(dependencies, ['cashes'])
    .then(init)
    .catch(function (err) {
      messenger.error(err.toString());
    });
  }

  function init (model) {
    session.model = model;
  }

  function setSelectedCash (obj) {
    session.loading = true;
    vm.state = 'generate';
    session.selectedCash = obj;
    cache.put('selectedCash', obj);
    fill();
  }

  function fill () {
    clearIncomeExpense();

    var request = session.request = {
      dateFrom : util.sqlDate(session.dateFrom),
      dateTo : util.sqlDate(session.dateTo),
    };

    // Make sure the account_id has a valid value
    if (session.selectedCash) {
      request.account_id = session.selectedCash.account_id;
    }
    else {
      request.account_id = null;
    }

    getCashflow()
    .then(getCurrencies)
    .then(prepareReport)
    .then(convert)
    .catch(function (err) {
      messenger.danger(err.toString());
    });
  }

  function getCashflow () {
    return $http({
      url : '/cashflow/report/',
      method : 'GET',
      params : session.request
    });
  }

  function getCurrencies(model) {
    session.allIncomes  = model.data.incomes;
    session.allExpenses = model.data.expenses;
    groupingResult(model.data.incomes, model.data.expenses);
    return validate.process(dependencies, ['currencies']);
  }

  function prepareReport (model) {
    session.model = model;
    vm.currencies = session.model.currencies;
    session.currency = SessionService.enterprise.currency_id;
    session.loading = false;
  }

  function sumDebit (a, b) { return b.debit + a; }
  function sumCredit (a, b) { return b.credit + a; }
  function sumValue (a, b) { return b.value + a; }

  function convert (){
    session.sum_debit  = 0;
    session.sum_credit = 0;
    if(session.allIncomes) {
      session.allIncomes.forEach(function (transaction) {
        session.sum_debit += exchange.convertir(transaction.debit, transaction.currency_id, session.currency, new Date());
      });
    }

    if(session.allExpenses) {
      session.allExpenses.forEach(function (transaction) {
        session.sum_credit += exchange.convertir(transaction.credit, transaction.currency_id, session.currency, new Date());
      });
    }

    convertGroup();
  }

  function convertGroup (){
    session.sum_debit_group = 0;
    session.sum_credit_group = 0;
    if(session.summationIncome) {
      session.summationIncome.forEach(function (transaction) {
        session.sum_debit_group += exchange.convertir(transaction.value, transaction.currency_id, session.currency, new Date()); //transaction.trans_date
      });
    }

    if(session.summationExpense) {
      session.summationExpense.forEach(function (transaction) {
        session.sum_credit_group += exchange.convertir(transaction.value, transaction.currency_id, session.currency, new Date()); //transaction.trans_date
      });
    }
  }

  function reconfigure () {
    vm.state = null;
    clearIncomeExpense();
  }

  function clearIncomeExpense () {
    session.summationIncome  = [];
    session.summationExpense = [];
    session.allIncomes       = [];
    session.allExpenses      = [];
  }

  function showDetails () {
    session.details = session.details ? false : true;
  }

  // Grouping by source
  function groupingResult (incomes, expenses) {
    var tempIncome  = {},
        tempExpense = {};

    // income
    if (incomes) {
      incomes.forEach(function (item, index) {
        tempIncome[item.service_txt] = angular.isDefined(tempIncome[item.service_txt]) ? false : true;

        if (tempIncome[item.service_txt] === true) {
          var value = incomes.reduce(function (a, b) {
            return b.service_txt === item.service_txt ? b.debit + a : a;
          }, 0);
          session.summationIncome.push({
            'service_txt' : item.service_txt,
            'currency_id' : item.currency_id,
            'value'       : value
          });
        }
      });
    }

    // Expense
    if (expenses) {
      expenses.forEach(function (item, index) {
        tempExpense[item.service_txt] = angular.isDefined(tempExpense[item.service_txt]) ? false : true;

        if (tempExpense[item.service_txt] === true) {
          var value = expenses.reduce(function (a, b) {
            return b.service_txt === item.service_txt ? b.credit + a : a;
          }, 0);
          session.summationExpense.push({
            'service_txt' : item.service_txt,
            'currency_id' : item.currency_id,
            'value'       : value
          });
        }
      });
    }
  }

  /**
    * getSource
    * This function translate humanly a transaction type
    * @param : txt = string correponding to a transaction type
    */
  function getSource (txt) {
    // FIXME: translation broken
    // return transactionSource.source(txt);
    return txt;
  }
}
