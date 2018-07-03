angular.module('bhima.controllers')
  .controller('ComplexJournalVoucherController', ComplexJournalVoucherController);

ComplexJournalVoucherController.$inject = [
  'VoucherService', 'CurrencyService', 'SessionService', 'FindEntityService',
  'FindReferenceService', 'NotifyService', 'VoucherToolkitService',
  'ReceiptModal', 'bhConstants', 'uiGridConstants', 'VoucherForm', '$timeout',
  'ExchangeRateService',
];

/**
 * @overview ComplexJournalVoucherController
 *
 * @description
 * This module implements complex journal vouchers. It allows users to quickly create transactions by
 * specifying two or more lines of transactions and all relative document references
 *
 * @constructor
 *
 * TODO - Implement caching mechanism for incomplete forms (via AppCache)
 * TODO/FIXME - this error notification system needs serious refactor.
 */
function ComplexJournalVoucherController(
  Vouchers, Currencies, Session, FindEntity, FindReference, Notify, Toolkit,
  Receipts, bhConstants, uiGridConstants, VoucherForm, $timeout, Rates
) {
  const vm = this;

  // bind constants
  vm.bhConstants = bhConstants;
  vm.enterprise = Session.enterprise;
  vm.itemIncrement = 1;
  vm.timestamp = new Date();

  vm.currentCurrency = {
    id : vm.enterprise.currency_id,
    rate : 1,
  };
  // bind the complex voucher form
  vm.Voucher = new VoucherForm('ComplexVouchers');

  // fired to clear the grid
  vm.clear = function clear(form) {
    vm.Voucher.clear();
    form.$setPristine();
  };

  // fired on changes
  vm.onChanges = function onChanges() {
    vm.Voucher.onChanges();
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.EDIT);
  };

  vm.currencyChange = function currencyChange(vCurrencyId) {
    const entCurrencyId = vm.enterprise.currency_id;
    let exchange = {};
    Rates.read(true).then(() => {
      if (vCurrencyId !== entCurrencyId) {
        exchange = Rates.getCurrentExchange(vCurrencyId);
        vm.currentCurrency = { id : vCurrencyId, rate : exchange.rate };
        vm.gridOptions.data = vm.gridOptions.data.map(row => {
          row.credit *= exchange.rate;
          row.debit *= exchange.rate;
          return row;
        });
      } else {
        vm.gridOptions.data = vm.gridOptions.data.map(row => {
          row.credit /= vm.currentCurrency.rate;
          row.debit /= vm.currentCurrency.rate;
          return row;
        });
      }
    });
  };

  // ui-grid options
  vm.gridOptions = {
    appScopeProvider  : vm,
    fastWatch         : true,
    flatEntityAccess  : true,
    enableSorting     : false,
    enableColumnMenus : false,
    showColumnFooter  : true,
    onRegisterApi,
  };

  function onRegisterApi(api) {
    vm.gridApi = api;
  }

  vm.openConventionPaymentModal = function openConventionPaymentModal() {
    gridManager(Toolkit.openConventionPaymentModal);
  };

  vm.openGenericIncomeModal = function openGenericIncomeModal() {
    gridManager(Toolkit.openGenericIncomeModal);
  };


  vm.openGenericExpenseModal = function openGenericExpenseModal() {
    gridManager(Toolkit.openGenericExpenseModal);
  };

  vm.openCashTransferModal = function openCashTransferModal() {
    gridManager(Toolkit.openCashTransferModal);
  };

  vm.openSupportPatientModal = function openSupportPatientModal() {
    gridManager(Toolkit.openSupportPatientModal);
  };

  vm.openPaymentEmployees = function openPaymentEmployees() {
    gridManager(Toolkit.openPaymentEmployees);
  };


  // @TODO fixed me to display correctly selected items(invoices, ..) accounts
  // without adding empty items before
  function gridManager(modal) {
    vm.Voucher.addItems(300);
    modal().then(result => {
      if (!result) {
        removeNullRows();
        if (vm.Voucher.store.data.length === 0) {
          vm.Voucher.addItems(2);
        }
        return;
      }
      processVoucherToolRows(result);
    });
  }
  /**
   * @function processVoucherToolRows
   *
   * @description this function handle the result of the tool modal
   */
  function processVoucherToolRows(result) {
    if (!result) { return; }
    // force updating details
    vm.Voucher.replaceFormRows(result.rows);

    updateView(result);
  }

  /**
   * @method updateView
   *
   * @description
   * this function force to update details of the voucher
   * and remove unnecessary rows
   *
   * @param {object} result
   */
  function updateView(result) {

    $timeout(() => {
      // transaction type
      vm.Voucher.details.type_id = result.type_id || vm.Voucher.details.type_id;

      // description
      vm.Voucher.description(result.description || vm.Voucher.details.description);

      // currency
      vm.Voucher.details.currency_id = result.currency_id || vm.Voucher.details.currency_id;

      removeNullRows();

    }, 0);
  }


  /**
   * @function removeNullRows
   *
   * @description remove null rows
   */
  function removeNullRows() {
    const gridData = JSON.parse(JSON.stringify(vm.gridOptions.data));
    gridData.forEach((item) => {
      if (!item.account_id) {
        vm.Voucher.store.remove(item.uuid);
      }
    });
  }

  /** ======================== end voucher tools ======================= */

  // bind the startup method as a reset method
  vm.submit = submit;
  vm.currencySymbol = currencySymbol;
  vm.openEntityModal = openEntityModal;
  vm.openReferenceModal = openReferenceModal;

  // load the available currencies
  Currencies.read()
    .then((currencies) => {
      currencies.forEach((currency) => {
        currency.label = Currencies.format(currency.id);
      });
      vm.currencies = currencies;
    })
    .catch(Notify.handleError);

  /** Entity modal */
  function openEntityModal(row) {
    FindEntity.openModal()
      .then((entity) => {
        row.entity = entity;
      });
  }

  /** Reference modal */
  function openReferenceModal(row) {
    FindReference.openModal(row.entity)
      .then((doc) => {
        row.configure({ document : doc });
      });
  }

  /** Get the selected currency symbol */
  function currencySymbol(currencyId) {
    if (!currencyId) { return ''; }
    return Currencies.symbol(currencyId);
  }

  /** run the module on startup and refresh */
  function startup() {
    vm.gridOptions.data = vm.Voucher.store.data;
  }

  /* ============================= Transaction Type ============================= */

  Vouchers.transactionType()
    .then((list) => {
      vm.types = list;
    })
    .catch(Notify.handleError);

  /* ============================= Grid ====================================== */

  // grid default options
  vm.gridOptions.columnDefs = [{
    field                : 'isValid',
    displayName          : '...',
    cellTemplate         : 'modules/vouchers/templates/status.grid.tmpl.html',
    aggregationType      : uiGridConstants.aggregationTypes.count,
    aggregationHideLabel : true,
    footerCellClass      : 'text-center',
    width                : 40,
  }, {
    field            : 'account',
    displayName      : 'FORM.LABELS.ACCOUNT',
    headerCellFilter : 'translate',
    cellTemplate     : 'modules/vouchers/templates/account.grid.tmpl.html',
    width            : '35%',
  }, {
    field                : 'debit',
    displayName          : 'FORM.LABELS.DEBIT',
    headerCellFilter     : 'translate',
    cellTemplate         : 'modules/vouchers/templates/debit.grid.tmpl.html',
    aggregationType      : uiGridConstants.aggregationTypes.sum,
    aggregationHideLabel : true,
    footerCellFilter     : 'currency:grid.appScope.Voucher.details.currency_id',
    footerCellClass      : 'text-right',
  }, {
    field                : 'credit',
    displayName          : 'FORM.LABELS.CREDIT',
    headerCellFilter     : 'translate',
    cellTemplate         : 'modules/vouchers/templates/credit.grid.tmpl.html',
    aggregationType      : uiGridConstants.aggregationTypes.sum,
    aggregationHideLabel : true,
    footerCellFilter     : 'currency:grid.appScope.Voucher.details.currency_id',
    footerCellClass      : 'text-right',
  }, {
    field            : 'entity',
    displayName      : 'FORM.LABELS.DEBTOR_CREDITOR',
    headerCellFilter : 'translate',
    cellTemplate     : 'modules/vouchers/templates/entity.grid.tmpl.html',
  }, {
    field            : 'reference',
    displayName      : 'FORM.LABELS.REFERENCE',
    headerCellFilter : 'translate',
    cellTemplate     : 'modules/vouchers/templates/reference.grid.tmpl.html',
  }, {
    field        : 'action',
    displayName  : '...',
    width        : 25,
    cellTemplate : 'modules/vouchers/templates/remove.grid.tmpl.html',
  }];

  /* ============================= End Grid ================================== */

  /** submit data */
  function submit(form) {
    // stop submission if the form is invalid
    if (form.$invalid) {
      return Notify.danger('VOUCHERS.COMPLEX.INVALID_VALUES');
    }

    const valid = vm.Voucher.validate();

    if (!valid) {
      return Notify.danger(vm.Voucher._error);
    }

    const voucher = vm.Voucher.details;

    voucher.items = vm.Voucher.store.data;

    return Vouchers.create(voucher)
      .then((result) => {
        Receipts.voucher(result.uuid, true);
        vm.Voucher.clear();
        form.$setPristine();
      })
      .catch(Notify.handleError);
  }

  startup();
}
