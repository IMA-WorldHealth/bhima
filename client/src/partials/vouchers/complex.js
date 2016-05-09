angular.module('bhima.controllers')
.controller('ComplexJournalVoucherController', ComplexJournalVoucherController);

ComplexJournalVoucherController.$inject = [
  'VoucherService', '$translate', 'AccountService',
  'CurrencyService', 'SessionService', 'FindEntityService',
  'FindReferenceService', 'NotifyService'
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
 * @todo - Implement Patient Invoices data and Cash Payment data for modal
 * @todo - Implement a mean to categorise transactions for cashflow reports 
 */
function ComplexJournalVoucherController(Vouchers, $translate, Accounts, Currencies, Session, FindEntity, FindReference, Notify) {
  var vm = this;

  // bread crumb paths
  vm.paths = [{
    label : $translate.instant('VOUCHERS.COMPLEX.TITLE'),
    current: true
  }];

  // bind the startup method as a reset method
  vm.submit = submit;
  vm.currencySymbol     = currencySymbol;
  vm.addVoucherItem     = addVoucherItem;
  vm.removeVoucherItem  = removeVoucherItem;
  vm.checkRowValidity   = checkRowValidity;
  vm.selectAccount      = selectAccount;
  vm.openEntityModal    = FindEntity.openModal;
  vm.openReferenceModal = FindReference.openModal;

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

  /** Add transaction row */
  function addVoucherItem() {
    vm.rows.push(generateRow());
    checkRowValidity();
  }

  /** remove transaction row */
  function removeVoucherItem(index) {
    vm.rows.splice(index, 1);
    checkRowValidity();
  }

  /** generate row element */
  function generateRow() {
    return {
      account_id    : undefined,
      debit         : 0,
      credit        : 0,
      document_uuid : undefined,
      entity_uuid   : undefined
    };
  }

  /** clean and generate voucher correct data */
  function handleVoucher() {
    var voucher;
    if (vm.sumCredit === vm.sumDebit) {
      voucher = {
        project_id : Session.project.id,
        date : vm.voucher.date,
        description : vm.voucher.description,
        currency_id : vm.voucher.currency_id,
        amount : vm.sumDebit,
        user_id : Session.user.id,
      };
    }
    return voucher;
  }

  /** clean and generate voucher items data */
  function handleVoucherItems() {
    var voucherItems = [];
    if (vm.validInput) {

      var entity_uuid = undefined;
      var document_uuid = undefined;

      vm.rows.forEach(function (row) {

        entity_uuid = row.entity && row.entity.uuid ? row.entity.uuid : '';
        document_uuid = row.reference && row.reference.document_uuid ? row.reference.document_uuid : '';

        var line = {
          account_id    : row.account_id,
          debit         : row.debit,
          credit        : row.credit,
          document_uuid : document_uuid,
          entity_uuid   : entity_uuid
        };

        voucherItems.push(line);
      });
    }
    return voucherItems;
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
    vm.posted = false;
    vm.rowsInput = validRowsInput();
    vm.validInput = vm.rowsInput.validAmount && vm.rowsInput.validAccount && vm.rowsInput.validTotals && vm.rows.length > 1 ? true : false;
    vm.notifyMessage =
      !vm.rowsInput.validAmount ? { icon : 'glyphicon glyphicon-alert', label : 'VOUCHERS.COMPLEX.ERROR_AMOUNT' } :
      !vm.rowsInput.validAccount ? { icon : 'glyphicon glyphicon-alert', label : 'VOUCHERS.COMPLEX.ERROR_ACCOUNT' } :
      !vm.rowsInput.validTotals ? { icon : 'glyphicon glyphicon-alert', label : 'VOUCHERS.COMPLEX.ERROR_TOTALS' } :
      vm.rowsInput.validTotals && vm.validInput ? { icon : 'glyphicon glyphicon-check', label : 'VOUCHERS.COMPLEX.VALID_TOTALS' } :
      { iconn : '', label : '' };
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

  /** select account id for the row */
  function selectAccount(account, row) {
    row.account_id = account.id;
    checkRowValidity();
  }

  /** run the module on startup and refresh */
  function startup() {
    // init posted variable
    vm.posted = false;

    // current timestamp to limit date
    vm.timestamp = new Date();

    // set up default voucher values
    vm.voucher = {};
    vm.voucher.date = new Date();

    // setup the enterprise currency as default
    vm.voucher.currency_id = Session.enterprise.currency_id;

    // init voucher items with two rows
    vm.rows = [];
    vm.rows.push(generateRow());
    vm.rows.push(generateRow());

    // init sum debit and credit
    vm.sumDebit  = 0;
    vm.sumCredit = 0;
  }

  /** submit data */
  function submit(form) {

    // stop submission if the form is invalid
    if (form.$invalid) {
      Notify.danger('VOUCHERS.COMPLEX.INVALID_VALUES');
      return;
    }

    checkRowValidity();

    var voucherItems = handleVoucherItems();

    var voucher = handleVoucher();

    if (voucherItems.length > 0) {
      voucher.items = voucherItems;
    }

    return Vouchers.create(voucher)
    .then(function (result) {
      Notify.success('VOUCHERS.COMPLEX.CREATE_SUCCESS');
      form.$setPristine();
      startup();
      checkRowValidity();
      vm.posted = true;
    })
    .catch(function (err) {
      Notify.danger('VOUCHERS.COMPLEX.CREATE_ERROR');
    });

  }

  startup();
}
