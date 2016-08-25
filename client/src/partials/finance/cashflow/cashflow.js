(function (angular) {
  'use strict';

  angular.module('bhima.controllers')
  .controller('CashflowController', CashflowController);

  // dependencies injection
  CashflowController.$inject = [
    'CashboxService', 'CashflowService', 'NotifyService', 'DateService',
    'ExchangeRateService', 'VoucherService', 'ModalService', 'LanguageService'
  ];

  /**
   * Cashflow controller
   *
   * @description
   * This controller is responsible of cash flow report, that report include
   * all incomes minus all depenses
   */
  function CashflowController(Cashbox, Cashflow, Notify, Dates, Exchange, Voucher, Modal, Languages) {
    var vm = this, session = vm.session = {};

    // global variables
    vm.state = 'default';

    // expose to the view
    vm.showDetails = false;
    vm.basicDate = Dates.util.str;
    vm.getTransferText = Voucher.getTransferText;
    vm.generate = generate;
    vm.reconfigure = reconfigure;
    vm.toggleDetails = toggleDetails;
    vm.print = renderDocument;

    /** generate cashflow report */
    function generate() {
      if (!vm.cashbox || !vm.dateFrom || !vm.dateTo) { return ; }
      session.currency_id = vm.cashbox ? vm.cashbox.currency_id : undefined;
      fill();
    }

    /** fill report with data */
    function fill() {
      var params = {
        account_id: [vm.cashbox.account_id],
        dateFrom: Dates.util.str(vm.dateFrom),
        dateTo: Dates.util.str(vm.dateTo),
        lang: Languages.key
      };
      Cashflow.read(null, params)
      .then(reporting)
      .then(labelization)
      .then(function () { vm.state = 'generate'; })
      .catch(Notify.handleError);
    }

    function renderDocument() {
      var params = {
        account_id: [vm.cashbox.account_id],
        dateFrom: Dates.util.str(vm.dateFrom),
        dateTo: Dates.util.str(vm.dateTo),
        lang: Languages.key
      };
      Modal.openReports({ url: '/finance/cashflow/document', params: params, renderer: 'pdf' });
    }

    /** show or hide details of the cashflow report */
    function toggleDetails() {
      vm.showDetails = !vm.showDetails;
    }

    /** reset report parameters */
    function reconfigure() {
      vm.state = undefined;

      initialization();
    }

    /**
     * @function reporting
     * @param {array} rows all transactions of the given cashbox
     * @description
     * processing data for the report, the process is as follow :
     * step 1. initialization : initialize all global array and objects
     * step 2. openning balance : process for getting the openning balance
     * step 3. grouping : group incomes and expenses by periods
     * step 4. summarization : get all periodical openning balance
     * step 5. labelization : define unique labels for incomes and expenses,
     * and process all totals needed
     */
    function reporting(rows) {
      initialization();

      session.periodicData = rows.flows;
      session.openningBalance = vm.onlyCashes ? rows.openningBalance.balance : Exchange.convertToEnterpriseCurrency(session.currency_id, new Date(), rows.openningBalance.balance);

      session.periodicData.forEach(function (flow) {
        groupingResult(flow.incomes, flow.expenses, Dates.util.str(flow.period.start_date));
      });

      session.periodStartArray = session.periodicData.map(function (flow) {
        return Dates.util.str(flow.period.start_date);
      });

      /** openning balance by period */
      session.periodicData.forEach(function (flow) {
        summarization(Dates.util.str(flow.period.start_date));
      });
    }

    /**
     * @function initialization
     * @description initialize global arrays and objects for the cashflow report
     */
    function initialization () {
      session.incomes          = {};
      session.expenses         = {};
      session.summationIncome  = {};
      session.summationExpense = {};
      session.sum_incomes      = {};
      session.sum_expense      = {};
      session.periodicBalance  = {};
      session.periodicOpenningBalance = {};
      session.incomesLabels    = [];
      session.expensesLabels   = [];
      session.totalIncomes     = {};
      session.totalExpenses    = {};
    }

    /**
     * @function summarization
     * @param {object} period An object wich reference a specific period
     * @description process for getting openning balance for each periods
     */
    function summarization (period){
      session.sum_incomes[period] = 0;
      session.sum_expense[period] = 0;

      if(session.summationIncome[period]) {
        session.summationIncome[period].forEach(function (transaction) {
          // if only cashes values must be in only enterprise currency
          session.sum_incomes[period] += vm.onlyCashes ? transaction.value : Exchange.convertToEnterpriseCurrency(session.currency_id, new Date(), transaction.value);
          session.incomesLabels.push(transaction.transfer_type);
        });
      }

      if(session.summationExpense[period]) {
        session.summationExpense[period].forEach(function (transaction) {
          // if only cashes values must be in only enterprise currency
          session.sum_expense[period] += vm.onlyCashes ? transaction.value : Exchange.convertToEnterpriseCurrency(session.currency_id, new Date(), transaction.value);
          session.expensesLabels.push(transaction.transfer_type);
        });
      }

      session.periodicBalance[period] = isFirstPeriod(period) ?
        session.sum_incomes[period] - session.sum_expense[period] :
        session.periodicBalance[previousPeriod(period)] + session.sum_incomes[period] - session.sum_expense[period];

      session.periodicOpenningBalance[period] = isFirstPeriod(period) ?
        session.openningBalance :
        session.periodicBalance[previousPeriod(period)];

    }

    /**
     * @function isFirstPeriod
     * @param {object} period An object wich reference a specific period
     * @description process to know the first period in the fiscal year
     */
    function isFirstPeriod(period) {
      var reference = session.periodStartArray[0];

      var bool = (new Date(reference).getDate() === 1 && new Date(reference).getMonth() === 0) ?
        new Date(period).getDate() === 1 && new Date(period).getMonth() === 0 :
        new Date(period).getDate() === new Date(reference).getDate() &&
        new Date(period).getMonth() === new Date(reference).getMonth() &&
        new Date(period).getYear() === new Date(reference).getYear();

      return bool;
    }

    /**
     * @function previousPeriod
     * @param {object} period An object wich reference a specific period
     * @description process to know the previous period of the given period
     */
    function previousPeriod(period) {
      var currentIndex = session.periodStartArray.indexOf(Dates.util.str(period));
      return (currentIndex !== 0) ? session.periodStartArray[currentIndex - 1] : session.periodStartArray[currentIndex];
    }

    /**
     * @function labelization
     * @description process for getting unique labels for incomes and expenses,
     * and all totals needed
     */
    function labelization () {
      var uniqueIncomes = [], uniqueExpenses = [];
      session.incomesLabels = uniquelize(session.incomesLabels);
      session.expensesLabels = uniquelize(session.expensesLabels);

      /** incomes rows */
      session.periodicData.forEach(function (flow) {
        session.incomes[Dates.util.str(flow.period.start_date)] = {};
        session.incomesLabels.forEach(function (label) {
          session.summationIncome[Dates.util.str(flow.period.start_date)].forEach(function (transaction) {
            if (transaction.transfer_type === label) {
              session.incomes[Dates.util.str(flow.period.start_date)][label] = vm.onlyCashes ? transaction.value : Exchange.convertToEnterpriseCurrency(session.currency_id, new Date(), transaction.value);
            }
          });
        });
      });

      /** totals incomes rows */
      session.periodicData.forEach(function (flow) {
        session.totalIncomes[Dates.util.str(flow.period.start_date)] = 0;
        session.summationIncome[Dates.util.str(flow.period.start_date)].forEach(function (transaction) {
          session.totalIncomes[Dates.util.str(flow.period.start_date)] += vm.onlyCashes ? transaction.value : Exchange.convertToEnterpriseCurrency(session.currency_id, new Date(), transaction.value);
        });
      });

      /** expense rows */
      session.periodicData.forEach(function (flow) {
        session.expenses[Dates.util.str(flow.period.start_date)] = {};
        session.expensesLabels.forEach(function (label) {
          session.summationExpense[Dates.util.str(flow.period.start_date)].forEach(function (transaction) {
            if (transaction.transfer_type === label) {
              session.expenses[Dates.util.str(flow.period.start_date)][label] = vm.onlyCashes ? transaction.value : Exchange.convertToEnterpriseCurrency(session.currency_id, new Date(), transaction.value);
            }
          });
        });
      });

      /** totals expenses rows */
      session.periodicData.forEach(function (flow) {
        session.totalExpenses[Dates.util.str(flow.period.start_date)] = 0;
        session.summationExpense[Dates.util.str(flow.period.start_date)].forEach(function (transaction) {
          session.totalExpenses[Dates.util.str(flow.period.start_date)] += vm.onlyCashes ? transaction.value : Exchange.convertToEnterpriseCurrency(session.currency_id, new Date(), transaction.value);
        });
      });

    }

    /**
     * @function uniquelize
     * @param {array} array An array in which we want to get only unique values
     * @description return an array which contain only unique values
     */
    function uniquelize (array) {
      var u = {}, a = [];
      for(var i = 0; i < array.length; i++){
        if(u.hasOwnProperty(array[i])) {
           continue;
        }
        a.push(array[i]);
        u[array[i]] = 1;
      }
      return a;
    }

    /**
     * @function groupingResult
     * @param {object} period An object wich reference a specific period
     * @param {array} incomes An array which contain incomes for the period
     * @param {array} expenses An array which contain expenses for the period
     * @description group incomes and expenses by `origin_id` for each period
     */
    function groupingResult (incomes, expenses, period) {
      var tempIncome  = {},
          tempExpense = {};

      session.summationIncome[period] = [];
      session.summationExpense[period] = [];

      // income
      if (incomes) {
        incomes.forEach(function (item, index) {
          tempIncome[item.origin_id] = angular.isDefined(tempIncome[item.origin_id]) ? false : true;

          if (tempIncome[item.origin_id] === true) {
            var value = incomes.reduce(function (a, b) {
              return b.origin_id === item.origin_id ? b.debit_equiv + a : a;
            }, 0);
            session.summationIncome[period].push({
              'transfer_type' : Voucher.getTransferText(item.origin_id),
              'currency_id'   : item.currency_id,
              'value'         : value
            });
          }
        });
      }

      // Expense
      if (expenses) {
        expenses.forEach(function (item, index) {
          tempExpense[item.origin_id] = angular.isDefined(tempExpense[item.origin_id]) ? false : true;

          if (tempExpense[item.origin_id] === true) {
            var value = expenses.reduce(function (a, b) {
              return b.origin_id === item.origin_id ? b.credit_equiv + a : a;
            }, 0);
            session.summationExpense[period].push({
              'transfer_type' : Voucher.getTransferText(item.origin_id),
              'currency_id'   : item.currency_id,
              'value'         : value
            });
          }
        });
      }
    }

    /** starup */
    (function starup() {

      // load cashboxes
      Cashbox.read(null, { detailed: 1, is_auxiliary: 0})
      .then(function (list) {
        vm.cashboxes = list;
      })
      .catch(Notify.errorHandler);

    })();

  }

})(angular);
