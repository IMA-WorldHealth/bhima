angular.module('bhima.controllers')
.controller('ComplexJournalVoucherController', ComplexJournalVoucherController);

ComplexJournalVoucherController.$inject = [
  'VoucherService', '$translate', 'AccountService',
  'CurrencyService', 'SessionService', '$uibModal'
];

/**
 * Complex Journal Vouchers
 *
 * This module implements complex journal vouchers. It allows users to quickly create transactions by
 * specifying two or more lines of transactions and all relative document references
 *
 * @constructor
 *
 * @todo - Implement caching mechanism for incomplete forms (via AppCache)
 */
function ComplexJournalVoucherController(Vouchers, $translate, Accounts, Currencies, Session, Modal) {
  var vm = this;

  // bread crumb paths
  vm.paths = [{
    label : $translate.instant('VOUCHERS.COMPLEX.TITLE'),
    current: true
  }];

  // init valriables
  vm.rows = [];

  // bind the startup method as a reset method
  vm.reset  = startup;
  vm.submit = submit;
  vm.currencySymbol    = currencySymbol;
  vm.addVoucherItem    = addVoucherItem;
  vm.removeVoucherItem = removeVoucherItem;
  vm.checkRowValidity  = checkRowValidity;
  vm.selectAccount     = selectAccount;

  // load the list of accounts
  Accounts.read()
  .then(function (accounts) {
    vm.accounts = accounts.map(function (item) {
      // remove children accounts
      delete item.children;
      return item;
    });
  });

  // load the available currencies
  Currencies.read()
  .then(function (currencies) {
    currencies.forEach(function (currency) {
      currency.label = Currencies.format(currency.id);
    });
    vm.currencies = currencies;
  });

  /** Get the selected currency symbol */
  function currencySymbol(currency_id) {
    if (!currency_id) { return ; }
    return Currencies.symbol(currency_id);
  }

  function addVoucherItem() {
    vm.rows.push(generateRow());
    checkRowValidity();
  }

  function removeVoucherItem(index) {
    vm.rows.splice(index, 1);
    checkRowValidity();
  }

  function generateRow() {
    return {
      account_id    : undefined,
      debit         : 0,
      credit        : 0,
      document_uuid : undefined,
      entity_uuid   : undefined
    };
  }

  /** validation function */
  function validRowsInput() {

    // validate amount
    var allValidAmount = vm.rows.every(function (row) {

      // must have a one non-zero value
      var validAmount =
        ((row.debit > 0 && !row.credit) || (!row.debit && row.credit > 0)) &&
        (angular.isDefined(row.debit) && angular.isDefined(row.credit));

      return validAmount;
    });

    // validate account
    var allValidAccount = vm.rows.every(function (row) {

      // must have an account defined
      var validAccount = (row.account && row.account.id);

      return validAccount;
    });

    // validate that the transaction balances
    var totals = vm.rows.reduce(function (aggregate, row) {
      aggregate.debit += row.debit;
      aggregate.credit += row.credit;
      return aggregate;
    }, { debit : 0, credit : 0 });

    var validTotals = totals.debit === totals.credit;

    // use multiple validation
    return {
      validAmount  : allValidAmount,
      validAccount : allValidAccount,
      validTotals  : validTotals
    };
  }

  /** check validity */
  function checkRowValidity() {
    vm.rowsInput = validRowsInput();
    vm.validInput = vm.rowsInput.validAmount && vm.rowsInput.validAccount && vm.rowsInput.validTotals ? true : false;
    summation();
  }

  /** summation */
  function summation() {
    vm.sumDebit  = 0;
    vm.sumCredit = 0;
    vm.rows.forEach(function (row) {
      vm.sumDebit += row.debit;
      vm.sumCredit += row.credit;
    });
  }

  function selectAccount(account, row) {
    row.account_id = account.id;
    checkRowValidity();
  }

  /** run the module on startup and refresh */
  function startup() {
    // delete any state indicators (if they exist)
    delete vm.created;

    // current timestamp to limit date
    vm.timestamp = new Date();

    // set up default voucher values
    vm.voucher = {};
    vm.voucher.date = new Date();

    // setup the enterprise currency as default
    vm.voucher.currency_id = Session.enterprise.currency_id;

    // init voucher items with two rows
    vm.rows.push(generateRow());
    vm.rows.push(generateRow());

    // init sum debit and credit
    vm.sumDebit  = 0;
    vm.sumCredit = 0;
  }

  function submit(form) {

    // stop submission if the form is invalid
    if (form.$invalid) {
      return;
    }

  }

  /**
   * Entity Modal
   */
  function openEntityModal(row) {

    var instance = Modal.open({
      templateUrl : 'partials/templates/modals/findEntity.modal.html',
      controller  : 'FindEntityModalController as FindEntityModalCtrl',
      size        : 'md',
      animation   : false
    });

    instance.result.then(function (result) {
      row.entity = result.entity;
    });

  }

  startup();
}
