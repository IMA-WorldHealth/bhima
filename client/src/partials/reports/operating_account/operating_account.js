angular.module('bhima.controllers')
.controller('OperatingAccountController', OperatingAccountController);

OperatingAccountController.$inject = [
  '$translate', '$window', 'validate', 'SessionService', 'connect',
  'exportFile', 'util', 'SessionService'
];

/**
* Operating Account controller
* This controller is responsible to generate a report of operations
*/
function OperatingAccountController($translate, $window, validate, SessionService, connect, exportFile, util, Session) {
  var vm = this,
      dependencies = {},
      session = vm.session = {},
      state = vm.state;

  vm.enterprise = Session.enterprise;

  dependencies.fiscalYears = {
    query : {
      identifier : 'id',
      tables : {
        'fiscal_year' : {
          columns : ['id', 'fiscal_year_txt']
        }
      }
    }
  };

  dependencies.periods = {
    query : {
      identifier : 'id',
      tables : {
        'period' : {
          columns : ['id', 'fiscal_year_id', 'period_start', 'period_stop']
        }
      }
    }
  };

  // Expose to view
  vm.all = 'all';
  vm.getPeriods = getPeriods;
  vm.generate = generate;
  vm.reconfigure = reconfigure;
  vm.printReport = function () { $window.print(); };
  vm.download = download;
  vm.formatPeriod = formatPeriod;
  vm.totals = {};

  // Startup
  startup();

  // Functions
  function startup() {
    vm.enterprise = SessionService.enterprise;
    validate.process(dependencies)
    .then(initialize);
  }

  function initialize(models) {
    angular.extend(vm, models);
  }

  function getPeriods() {
    // TODO -- remove this check
    var selectablePeriods = vm.periods.data.filter(function (p) {
      return p.fiscal_year_id === session.fiscal_year_id && p.period_start !== '0000-00-00';
    });
    vm.selectablePeriods = selectablePeriods;
  }

  function formatPeriod(per) {
    return '' + util.htmlDate(per.period_start) + ' -- ' + util.htmlDate(per.period_stop);
  }

  // since we allow users to select either a fiscal year and a period OR two dates,
  // we need to change the server API.
  function generate() {
    if (session.period_id === 'all') {
      vm.all_period = $translate.instant('OPERATING_ACCOUNT.ALL');
    }

    connect.fetch('/reports/operatingAccount/?period_id=' + session.period_id + '&fiscal_id=' + session.fiscal_year_id)
    .then(function (data) {

      vm.totals = data.reduce(function (totals, row) {
        if(row.classe === 6){
          if(row.debit > row.credit) {
            row.debit -= row.credit;
            row.credit = 0;
          } else if(row.debit < row.credit) {
            row.credit -= row.debit;
            row.debit = 0;            
          }
        } else if (row.classe === 7){
          if(row.credit > row.debit ) {
            row.credit -= row.debit;
            row.debit = 0;
          } else if(row.credit < row.debit ) {
            row.debit -= row.credit;
            row.credit = 0;
          }
        }        
        totals.debit += row.debit;
        totals.credit += row.credit;
        totals.balance += (row.credit - row.debit);
        return totals;
      }, { debit : 0, credit : 0, balance: 0});

      vm.records = data;
      vm.state = 'generate';
    });
  }

  function download() {
    var fileData = {};
    var periodInfo = (session.period_id === 'all') ?
      vm.all_period :
      (util.htmlDate(vm.periods.get(session.period_id).period_start)) + '_' + (util.htmlDate(vm.periods.get(session.period_id).period_stop));

    var fileName = $translate.instant('OPERATING_ACCOUNT.TITLE') +
                  '_' + vm.fiscalYears.get(session.fiscal_year_id).fiscal_year_txt +
                  '_' + periodInfo;

    fileData.column = [
      $translate.instant('COLUMNS.ACCOUNT'),
      $translate.instant('COLUMNS.LABEL'),
      $translate.instant('COLUMNS.CHARGE'),
      $translate.instant('COLUMNS.PROFIT')
    ];

    fileData.data = vm.records.map(function (item) {
      return {
        'number' : item.number,
        'label'    : item.label,
        'credit'         : item.debit,
        'debit'          : item.credit
      };
    });

    exportFile.csv(fileData, fileName, false);
  }

  function reconfigure () {
    vm.state = null;
    session.fiscal_year_id = null;
    session.period_id = null;
  }
}
