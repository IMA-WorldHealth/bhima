angular.module('bhima.controllers')
.controller('ReportGlobalTransactionController', ReportGlobalTransactionController);

ReportGlobalTransactionController.$inject = [
  'connect', '$translate', 'validate', 'util', 'exchange', 'SessionService', 'exportFile'
];

/**
* Reprot Global Transaction Controller
* This controller is responsible for managing report of all transactions
*
* TODO/FIXME
*  -- Why does this use exchange? The data should be from the journal/general ledger
*  and those are already converted!
*/
function ReportGlobalTransactionController (connect, $translate, validate, util, exchange, SessionService, exportFile) {
  var vm = this,
      session = vm.session = {},
      state = vm.state = {},
      dependencies = {},
      map = {};

  dependencies.accounts = {
    required : true,
    query : {
      tables : {'account' : {columns : ['id', 'account_number', 'account_txt', 'account_type_id']}}
    }
  };

  dependencies.exchange_rate = {
    query : {
      tables : {
        'exchange_rate' : {
          columns : ['id', 'foreign_currency_id', 'rate', 'date']
        }
      }
    }
  };

  dependencies.currencies = {
    query : {
      tables : {
        'currency' : {
          columns : ['id', 'symbol']
        }
      }
    }
  };

  vm.account          = {};
  vm.model            = {};
  vm.model.sources    = [$translate.instant('SELECT.ALL'), $translate.instant('SELECT.POSTING_JOURNAL'), $translate.instant('SELECT.GENERAL_LEDGER')];
  session.somDebit    = 0;
  session.somCredit   = 0;
  session.loaderState = 'loading';

  // Expose to the view
  vm.formatAccount = formatAccount;
  vm.generate      = generate;
  vm.reconfigure   = reconfigure;
  vm.printReport   = printReport;
  vm.download      = download;

  // Startup
  startup();

  // Functions
  function startup() {
    vm.enterprise = SessionService.enterprise;
    dependencies.accounts.query.where = ['account.enterprise_id=' + vm.enterprise.id];
    validate.process(dependencies)
    .then(init);
  }

  function formatAccount(account) {
    return [
      account.account_number, account.account_txt
    ].join(' -- ');
  }

  function init(model) {
    session.dateFrom = new Date();
    session.dateTo = new Date();
    angular.extend(vm, model);

    vm.accounts.data.forEach(function (account) {
      account.account_number = String(account.account_number);

      // Define formatted account string at load time as this will never have to change again
      account.display = formatAccount(account);
    });
    vm.model.c = vm.enterprise.currency_id;
    vm.model.account_id = 0;
    vm.model.source_id = 0;

    vm.exchange_rate.data.forEach(function (item) {
      map[util.sqlDate(new Date())] = {c_id : item.foreign_currency_id, rate : item.rate};
    });
  }

  function loadView() {
    vm.state             = 'generate';
    session.loaderState  = 'loading';
    session.buttonLoader = false;
  }

  function getValue (obj, val, cVal) {
    if (cVal === vm.model.c) { return val; }
    return (obj.c_id === cVal)? 1 : (obj.rate) * val; //not good because it supporte only two currency, I will fix it very soon
  }

  function getTotal(items) {
    var sCredit = 0,
        sDebit = 0;

    session.somCredit = 0;
    session.somDebit = 0;

    items.forEach(function (item) {
      sCredit += item.credit;
      sDebit += item.debit;
    });

    session.somCredit = Number(exchange.convertir(sCredit, vm.enterprise.currency_id, vm.model.c, new Date())).toFixed(2);
    session.somDebit  = Number(exchange.convertir(sDebit, vm.enterprise.currency_id, vm.model.c, new Date())).toFixed(2);
    session.solde     = session.somDebit - session.somCredit;

    // End loading indicator
    session.loaderState = 'loaded';

  }

  function generate() {
    session.buttonLoader = true;
    if (!vm.enterprise || !vm.exchange_rate) {return;}
    var accountFilter = (vm.model.account_id && vm.model.account_id > 0) ? vm.model.account_id : 0;
    var url = '/reports/allTransactions/?source=' + vm.model.source_id +
      '&enterprise_id=' + vm.enterprise.id +
      '&account_id=' + accountFilter +
      '&datef=' + util.sqlDate(session.dateFrom) +
      '&datet=' + util.sqlDate(session.dateTo);

    session.account_number = vm.model.account_id ? vm.accounts.get(vm.model.account_id).account_number : '';
    connect.fetch(url)
    .then(function (res) {
      vm.records = res;
      return res;
    })
    .then(getTotal)
    .then(loadView)
    .catch(handleError);
  }

  function reconfigure() {
    vm.state = null;
  }

  function printReport() {
    print();
  }

  function handleError(err) {
    console.error(err);
  }

  function download() {
    var fileData = {};
    var fileName = $translate.instant('ALLTRANSACTIONS.TITLE');

    fileData.column = [
      $translate.instant('COLUMNS.TRANS_ID'),
      $translate.instant('COLUMNS.TRANSACTION_DATE'),
      $translate.instant('COLUMNS.ACCOUNT_NUMBER'),
      $translate.instant('COLUMNS.DESCRIPTION'),
      $translate.instant('COLUMNS.DEBIT'),
      $translate.instant('COLUMNS.CREDIT')
    ];
    fileData.data = vm.records.map(function (item) {
      return {
        'trans_id'       : item.trans_id,
        'trans_date'     : util.htmlDate(item.trans_date),
        'account_number' : item.account_number,
        'description'    : item.description,
        'debit'          : item.debit,
        'credit'         : item.credit
      };
    });
    exportFile.csv(fileData, fileName, true);
  }

}
