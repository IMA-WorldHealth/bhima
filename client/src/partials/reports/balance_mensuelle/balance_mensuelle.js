angular.module('bhima.controllers')
.controller('ReportBalanceMensuelleController', ReportBalanceMensuelleController);

ReportBalanceMensuelleController.$inject = [
  '$translate', '$window', '$http', 'messenger', 'exportFile', 'SessionService',
  'DateService'
];

function ReportBalanceMensuelleController($translate, $window, $http, messenger, exportFile, Session, Dates) {
  var vm = this,
      dependencies = {},
      session = vm.session = {},
      state = vm.state;

  session.classes = [
    { number : 1, name : $translate.instant('ACCOUNT.ACCOUNT_EQUITY')},
    { number : 2, name : $translate.instant('ACCOUNT.ACCOUNT_ASSET')},
    { number : 3, name : $translate.instant('ACCOUNT.ACCOUNT_STOCKS')},
    { number : 4, name : $translate.instant('ACCOUNT.ACCOUNT_THPART')},
    { number : 5, name : $translate.instant('ACCOUNT.ACCOUNT_FINC')},
    { number : 6, name : $translate.instant('ACCOUNT.ACCOUNT_COST')},
    { number : 7, name : $translate.instant('ACCOUNT.ACCOUNT_REV')},
    { number : 8, name : $translate.instant('ACCOUNT.ACCOUNT_EXP_PROD')},
    { number : '*', name : $translate.instant('ACCOUNT.ALL_ACCOUNT')}
  ];


  // Expose to the view
  vm.loading = false;
  vm.download = download;
  vm.reconfigure = reconfigure;
  vm.submit = submit;
  vm.formatAccount = formatAccount;
  vm.print = printer;

  // Startup
  startup();

  // Functions
  function startup() {
    session.project = Session.project.id;
    session.enterprise = Session.enterprise;
  }

  // actually submits the form
  function submit(invalid) {
    var url;

    if (invalid) { return; }

    vm.state = 'generate';
    vm.loading = true;

    // empty data caches
    vm.accounts = {};
    vm.totals = {};

    url = '/reports/balance_mensuelle?' +
        'enterpriseId=' + Session.enterprise.id +
        '&classe=' + session.classe.number +
        '&date=' + Dates.util.str(session.periode);

    // get the data
    $http.get(url)
    .then(function (response) {
      var accounts,
          totals,
          data = response.data;

      function getSold (item){
        var result = {debit : 0, credit : 0}, sold = 0;

        if(item.is_asset === 1 || item.is_charge === 1){
          sold = item.debit - item.credit;
          if(sold < 0){
            result.credit = sold * -1 ;
          }else{
            result.debit = sold;
          }
        }else{
          sold = item.credit - item.debit;
          if(sold < 0){
            result.debit = sold * -1;
          } else{
            result.credit = sold;
          }
        }
        return result;
      }

      // make the accounts object
      accounts = data.beginning.reduce(function (init, row) {
        var account = init, id = row.number;
        var obj = account[id] = {}, sold = getSold(row);
        obj.label = row.label;
        obj.beginDebit = sold.debit;
        obj.beginCredit = sold.credit;
        obj.middleDebit = 0;
        obj.middleCredit = 0;
        obj.is_charge = row.is_charge;
        obj.is_asset = row.is_asset;
        account[id] = obj;
        return account;
      }, {});



      data.middle.forEach(function (row){
        var account = accounts[row.number] || {};
        account.middleDebit = row.debit;
        account.middleCredit = row.credit;
        account.label = row.label;
        account.is_charge = row.is_charge;
        account.is_asset = row.is_asset;
        accounts[row.number] = account;
      });

      Object.keys(accounts).forEach(function (item){
        accounts[item].endDebit = 0;
        accounts[item].endCredit = 0;
        var sold = (accounts[item].beginDebit || 0 - accounts[item].beginCredit || 0) + (accounts[item].middleDebit - accounts[item].middleCredit);
        if(sold < 0){
          accounts[item].endCredit = sold * -1;
        }else{
         accounts[item].endDebit = sold;
        }
      });

      // calculate totals
      totals = Object.keys(accounts).reduce(function (totals, key) {
        var account = accounts[key];
        totals.beginDebit += (account.beginDebit || 0);
        totals.beginCredit += (account.beginCredit || 0);
        totals.middleDebit += (account.middleDebit || 0);
        totals.middleCredit += (account.middleCredit || 0);
        totals.endDebit += (account.endDebit || 0);
        totals.endCredit += (account.endCredit || 0);
        return totals;
      }, {
        beginDebit : 0,
        beginCredit : 0,
        middleDebit: 0,
        middleCredit : 0,
        endDebit : 0,
        endCredit : 0
      });

      // expose to view
      vm.accounts = accounts;
      vm.totals = totals;
      vm.empty = Object.keys(accounts).length === 0;
    })
    .catch(function (error) {
      throw error;
    })
    .finally(function () {
      vm.loading = false;
    });
  }

  function formatAccount(classe) {
    return '[' + classe.number + ']' + classe.name;
  }

  function printer() { $window.print(); }

  function calculTotaux() {
    var sums = {
      sumOldDebit : 0,
      sumOldCredit : 0,
      sumDebit : 0,
      sumCredit : 0,
      solde_debit : 0,
      solde_credit :0
    };

    sums = vm.balance_mensuelle.data.reduce(function (summer, row) {
      summer.sumOldDebit += row.old_debit;
      summer.sumOldCredit += row.old_credit;
      summer.sumDebit += row.debit;
      summer.sumCredit += row.credit;
      summer.solde_debit += row.solde_debit;
      summer.solde_credit += row.solde_credit;
      return summer;
    }, sums);

    session.sumOldDebit = sums.sumOldDebit;
    session.sumOldCredit = sums.sumOldCredit;
    session.sumDebit = sums.sumDebit;
    session.sumCredit = sums.sumCredit;
    session.solde_debit = sums.solde_debit;
    session.solde_credit = sums.solde_credit;
  }

  function reconfigure () {
    vm.state = null;
    vm.session.classe = null;
    vm.session.periode = null;
  }

  function download() {
    var data = angular.copy(vm.accounts);
    var tbl = [];
    var fileData = {};
    var metadata = Dates.util.str(session.periode) + '_' + session.classe.number + '(' + session.classe.name + ')';
    var fileName = $translate.instant('BALANCE_MENSUELLE.TITLE') +
                  '_' + metadata;
    var occurences = Object.keys(data);    

    fileData.column = [
      $translate.instant('BALANCE_MENSUELLE.ACCOUNT'),
      $translate.instant('BALANCE_MENSUELLE.LABEL'),
      $translate.instant('BALANCE_MENSUELLE.OLD_SOLD'), 
      $translate.instant('BALANCE_MENSUELLE.OLD_SOLD'),
      $translate.instant('BALANCE_MENSUELLE.MONTH_MOVEMENT'),
      $translate.instant('BALANCE_MENSUELLE.MONTH_MOVEMENT'),
      $translate.instant('BALANCE_MENSUELLE.NEW_SOLD'),
      $translate.instant('BALANCE_MENSUELLE.NEW_SOLD')
    ];

    occurences = occurences.map(function (item){
      return {
        number : item,
        label    : data[item].label,
        old_debit      : data[item].beginDebit || 0,
        old_credit     : data[item].beginCredit || 0,
        debit          : data[item].middleDebit || 0,
        credit         : data[item].middleCredit || 0,
        solde_debit    : data[item].endDebit || 0,
        solde_credit   : data[item].endCredit || 0
      };
    });

    fileData.data = occurences;
    exportFile.csv(fileData, fileName, false);
  }
}
