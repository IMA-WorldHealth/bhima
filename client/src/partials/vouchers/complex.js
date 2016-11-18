angular.module('bhima.controllers')
.controller('ComplexJournalVoucherController', ComplexJournalVoucherController);

ComplexJournalVoucherController.$inject = [
  'VoucherService', '$translate', 'AccountService',
  'CurrencyService', 'SessionService', 'FindEntityService',
  'FindReferenceService', 'NotifyService', 'CashboxService',
  'VoucherToolkitService', 'ReceiptModal', 'bhConstants'
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
 * @todo/@fixme - this error notification system needs serious refactor.
 */
function ComplexJournalVoucherController(Vouchers, $translate, Accounts, Currencies, Session, FindEntity, FindReference, Notify, Cashbox, Toolkit, Receipts, bhConstants) {
  var vm = this;

  // bread crumb paths
  vm.paths = [{
    label : $translate.instant('VOUCHERS.COMPLEX.TITLE'),
    current: true
  }];

  // breadcrumb dropdown
  vm.dropdown = [
    {
      label: 'VOUCHERS.GLOBAL.TOOLS',
      color: 'btn-default',
      icon: 'fa-cogs',
      option: Toolkit.options
    }
  ];

  /** ======================== voucher tools ========================== */

  // toolkit action definition
  var conventionPaymentTool = Toolkit.tools.convention_payment;

  // action on convention payment tool
  conventionPaymentTool.action = openConventionPaymentTool;

  // open convention payment function
  function openConventionPaymentTool() {
    Toolkit.open(conventionPaymentTool)
    .then(function (result) {
      if (!result) { return; }

      vm.rows = result.rows;
      vm.rows.forEach(function (item) {
        checkRowValidity(item.index);
      });
      vm.gridOptions.data = vm.rows;
      refreshState();
      conventionPaymentDetails(result.convention);
    });
  }

  // set convention payment details
  function conventionPaymentDetails(convention) {
    vm.financialTransaction = true;
    let conventionType = vm.incomes.filter(function (item) {
      return item.id === 3;
    })[0];
    vm.voucher.type_id = JSON.stringify(conventionType);
    vm.voucher.description = convention.name;
    vm.defaultIncomeTypeId = 3;
    buildDescription();
  }

  /** ======================== end voucher tools ======================= */
  var MIN_DECIMAL_VALUE= bhConstants.lengths.minDecimalValue;
  var MIN_PRECISION_VALUE = getDecimalPrecision(MIN_DECIMAL_VALUE);

  // global variables
  vm.gridOptions = {};
  vm.gridApi = {};

  // bind the startup method as a reset method
  vm.submit = submit;
  vm.currencySymbol     = currencySymbol;
  vm.addVoucherItem     = addVoucherItem;
  vm.removeVoucherItem  = removeVoucherItem;
  vm.checkRowValidity   = checkRowValidity;
  vm.openEntityModal    = openEntityModal;
  vm.openReferenceModal = openReferenceModal;

  // load the list of accounts
  Accounts.read()
    .then(function (accounts) {
      vm.accounts = accounts;
    })
    .catch(Notify.handleError);

  // load the available currencies
  Currencies.read()
  .then(function (currencies) {
    currencies.forEach(function (currency) {
      currency.label = Currencies.format(currency.id);
    });
    vm.currencies = currencies;
  });

  /** Entity modal */
  function openEntityModal(row) {
    FindEntity.openModal()
      .then(function (entity) {
        row.entity = entity;
      });
  }

  /** Reference modal */
  function openReferenceModal(row) {
    FindReference.openModal(row.entity)
      .then(function (reference) {
        row.reference = reference;
      });
  }

  /** Get the selected currency symbol */
  function currencySymbol(currency_id) {
    if (!currency_id) { return ; }
    return Currencies.symbol(currency_id);
  }

  /** Add transaction row */
  function addVoucherItem() {
    vm.rows.push(generateRow());
    refreshState();
  }

  /** remove transaction row */
  function removeVoucherItem(index) {
    vm.rows.splice(index, 1);
    refreshState();
  }

  /** generate row element */
  function generateRow() {
    var index = vm.rows.length || 0;
    return {
      index         : index,
      account_id    : undefined,
      debit         : 0,
      credit        : 0,
      document_uuid : undefined,
      entity_uuid   : undefined
    };
  }

  /** clean and generate voucher correct data */
  function handleVoucher() {

    buildDescription();

    var voucher;
    var voucherTypeId = vm.voucher.type_id ? JSON.parse(vm.voucher.type_id).id : null;
    var voucherDescription = vm.descriptionPrefix.concat('/', vm.voucher.description);

    if (vm.sumCredit === vm.sumDebit) {
      voucher = {
        project_id  : Session.project.id,
        date        : vm.voucher.date,
        description : voucherDescription,
        currency_id : vm.voucher.currency_id,
        amount      : vm.sumDebit,
        user_id     : Session.user.id,
        type_id     : voucherTypeId
      };
    }

    return voucher;
  }

  /** clean and generate voucher items data */
  function handleVoucherItems() {
    var voucherItems = [];
    var account_id;
    var entity_uuid;
    var document_uuid;

    voucherItems = vm.rows.map(function (row) {

      account_id = row.account && row.account.id ? row.account.id : '';
      entity_uuid = row.entity && row.entity.uuid ? row.entity.uuid : '';
      document_uuid = row.reference && row.reference.uuid ? row.reference.uuid : '';

      return {
        account_id    : account_id,
        debit         : row.debit,
        credit        : row.credit,
        document_uuid : document_uuid,
        entity_uuid   : entity_uuid
      };

    });

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
      return row.account && row.account.id;
    });

    var allValidPrecision = vm.rows.every(function (row) {
      return (
        getDecimalPrecision(row.debit) <= MIN_PRECISION_VALUE &&
        getDecimalPrecision(row.credit) <= MIN_PRECISION_VALUE
      );
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
      validTotals  : validTotals,
      validPrecision : allValidPrecision
    };
  }

  /** check validity and refresh all bonding data */
  function refreshState() {
    vm.posted = false;
    vm.financialTransaction = false;
    vm.rowsInput = validRowsInput();

    vm.validInput = (
      vm.rowsInput.validAmount && vm.rowsInput.validAccount &&
      vm.rowsInput.validPrecision && vm.rowsInput.validTotals &&
      vm.rows.length > 1
    );

    vm.notifyMessage =
      !vm.rowsInput.validAmount ? { icon : 'glyphicon glyphicon-alert', label : 'VOUCHERS.COMPLEX.ERROR_AMOUNT' } :
      !vm.rowsInput.validAccount ? { icon : 'glyphicon glyphicon-alert', label : 'VOUCHERS.COMPLEX.ERROR_ACCOUNT' } :
      !vm.rowsInput.validTotals ? { icon : 'glyphicon glyphicon-alert', label : 'VOUCHERS.COMPLEX.ERROR_TOTALS' } :
      !vm.rowsInput.validPrecision ? { icon : 'glyphicon glyphicon-alert', label : 'VOUCHERS.COMPLEX.ERROR_PRECISION' } :
      vm.rowsInput.validTotals && vm.validInput ? { icon : 'glyphicon glyphicon-ok-sign', label : 'VOUCHERS.COMPLEX.VALID_TOTALS' } :
      { icon : '', label : '' };

    summation();
  }

  // get the length of the portion after the decimal point.
  function getDecimalPrecision(value) {
    var valueString = String(value);
    var decimalPart = valueString.split('.')[1] || [];
    return decimalPart.length;
  }

  /** checking validity of a row */
  function checkRowValidity(index) {
    if (angular.isUndefined(index)) { return; }

    var row = vm.rows[index];

    /** validity of the amount */
    var hasValidAmount =
      ((!row.credit && row.debit >= MIN_DECIMAL_VALUE) || (!row.debit && row.credit >= MIN_DECIMAL_VALUE)) &&
      (angular.isDefined(row.debit) && angular.isDefined(row.credit));

    /** must have an account defined */
    var hasValidAccount = (row.account && row.account.id);

    // the amounts recorded in each line should have the correct number of
    // digits after the decimal point
    var hasValidPrecision = (
      getDecimalPrecision(row.debit) <= MIN_PRECISION_VALUE &&
      getDecimalPrecision(row.credit) <= MIN_PRECISION_VALUE
    );

    /** validity of the row */
    row.isValid = hasValidAccount && hasValidAmount && hasValidPrecision;
    row.hasAccount = hasValidAccount;

    /**
     * refresh the ui to the real state
     * This function does a lot of process but it useful for informing the user
     * it notify about :
     * -- the validity of all amount given
     * -- the validity of totals (balanced or not)
     * -- the validity of accounts
     * -- the validity of missing values
     */
    refreshState();

    /**
     * Check financial account
     */
    isFinancial();
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
    vm.gridOptions.data = vm.rows;

    // init sum debit and credit
    vm.sumDebit  = 0;
    vm.sumCredit = 0;

    // init financial accounts
    vm.financialAccount = [];

    Cashbox.read(null, { detailed: 1 })
    .then(function (list) {

      list.forEach(function (item) {

        if (vm.financialAccount.indexOf(item.account_id) === -1) {
          vm.financialAccount.push(item.account_id);
        }

        if (vm.financialAccount.indexOf(item.transfer_account_id) === -1) {
          vm.financialAccount.push(item.transfer_account_id);
        }

      });

    })
    .catch(Notify.handleError);
  }

  /** check use of financial accounts */
  function isFinancial() {

    vm.financialTransaction = false;
    for (var i = 0; i < vm.rows.length; i++) {
      if (vm.rows[i].account && vm.financialAccount.indexOf(vm.rows[i].account.id) !== -1) {
        vm.financialTransaction = true;
        break;
      }
    }

    // prevent persistent value
    vm.voucher.type_id = vm.financialTransaction ? vm.voucher.type_id : null;

  }

  /* ============================= Transfer Type ============================= */
  Vouchers.transactionType()
  .then(function (list) {
    groupType(list.data);
  })
  .catch(Notify.handleError);

  vm.buildDescription = buildDescription;

  function groupType(array) {
    vm.incomes = array.filter(function (item) {
      return item.type === 'income';
    });
    vm.expenses = array.filter(function (item) {
      return item.type === 'expense';
    });
  }

  function buildDescription() {
    var type = vm.voucher.type_id,
        current = new Date(),
        description = String(Session.project.abbr).concat('/VOUCHER');

    if (type) {

      type = JSON.parse(type);

      vm.type = type.type;

      vm.descriptionPrefix = description
        .concat('/', type.prefix)
        .concat('/', current.toDateString());

    } else {

      vm.descriptionPrefix = description.concat('/', current.toDateString());

    }

  }
  /* ============================= End Transfer Type ========================= */


  /* ============================= Grid ====================================== */

  // grid default options
  vm.gridOptions.appScopeProvider = vm;
  vm.gridOptions.enableColumnMenus = false;
  vm.gridOptions.columnDefs       =
    [
      { field : 'isValid', displayName : '...',
        headerCellFilter: 'translate', cellFilter: 'translate',
        cellTemplate: 'partials/vouchers/templates/status.grid.tmpl.html',
        enableFiltering: false,
        enableColumnMenu: false,
        width: 40
      }, {
        field : 'account', displayName : 'FORM.LABELS.ACCOUNT',
        headerCellFilter: 'translate',
        cellTemplate: 'partials/vouchers/templates/account.grid.tmpl.html'
      }, {
        field : 'debit', displayName : 'FORM.LABELS.DEBIT',
        headerCellFilter: 'translate',
        cellTemplate: 'partials/vouchers/templates/debit.grid.tmpl.html'
      }, {
        field : 'credit', displayName : 'FORM.LABELS.CREDIT',
        headerCellFilter: 'translate',
        cellTemplate: 'partials/vouchers/templates/credit.grid.tmpl.html'
      }, {
        field : 'entity', displayName : 'FORM.LABELS.DEBTOR_CREDITOR',
        headerCellFilter: 'translate',
        cellTemplate: 'partials/vouchers/templates/entity.grid.tmpl.html',
      }, {
        field : 'reference', displayName : 'FORM.LABELS.REFERENCE',
        headerCellFilter: 'translate',
        cellTemplate: 'partials/vouchers/templates/reference.grid.tmpl.html',
      }, {
        field : 'action', displayName : '...',
        width: 25,
        cellTemplate: 'partials/vouchers/templates/remove.grid.tmpl.html',
      }
    ];

  // register API
  vm.gridOptions.onRegisterApi = onRegisterApi;

  /** API register function */
  function onRegisterApi(gridApi) {
    vm.gridApi = gridApi;
  }
  /* ============================= End Grid ================================== */

  /** submit data */
  function submit(form) {

    // stop submission if the form is invalid
    if (form.$invalid) {
      Notify.danger('VOUCHERS.COMPLEX.INVALID_VALUES');
      return;
    }

    // get the updated state of the module with all checks made
    refreshState();

    var voucherItems = handleVoucherItems();
    var voucher = handleVoucher();

    if (voucherItems.length > 0) {
      voucher.items = voucherItems;
    }

    return Vouchers.create(voucher)
      .then(function (result) {
        form.$setPristine();
        startup();
        refreshState();
        vm.posted = true;

        Receipts.voucher(result.uuid, true);
      })
      .catch(Notify.handleError);

  }

  startup();
}
