angular.module('bhima.controllers')
  .controller('ComplexJournalVoucherController', ComplexJournalVoucherController);

ComplexJournalVoucherController.$inject = [
  'VoucherService', '$translate', 'CurrencyService', 'SessionService',
  'FindEntityService', 'FindReferenceService', 'NotifyService',
  'VoucherToolkitService', 'ReceiptModal', 'bhConstants', 'GridAggregatorService',
  'uiGridConstants', 'VoucherForm', '$timeout',
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
 * @todo/@fixme - this error notification system needs serious refactor.
 */
function ComplexJournalVoucherController(Vouchers, $translate, Currencies, Session,
  FindEntity, FindReference, Notify, Toolkit, Receipts, bhConstants,
  GridAggregators, uiGridConstants, VoucherForm, $timeout) {
  var vm = this;

  // bind constants
  vm.bhConstants = bhConstants;
  vm.enterprise = Session.enterprise;
  vm.itemIncrement = 1;
  vm.timestamp = new Date();

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

  // bread crumb paths
  vm.paths = [{
    label : $translate.instant('TREE.FINANCE'),
  }, {
    label   : $translate.instant('VOUCHERS.COMPLEX.TITLE'),
    current : true,
  }];

  // breadcrumb dropdown
  vm.dropdown = [{
    label  : 'VOUCHERS.GLOBAL.TOOLS',
    color  : 'btn-default',
    icon   : 'fa-cogs',
    option : Toolkit.options,
  }];

  // ui-grid options
  vm.gridOptions = {
    appScopeProvider  : vm,
    fastWatch         : true,
    flatEntityAccess  : true,
    enableSorting     : false,
    enableColumnMenus : false,
    showColumnFooter  : true,
    onRegisterApi     : onRegisterApi,
  };

  function onRegisterApi(api) {
    vm.gridApi = api;
  }

  /** ======================== voucher tools ========================== */

  // toolkit action definition
  var conventionPaymentTool = Toolkit.tools.convention_payment;
  var supportPatientTool = Toolkit.tools.support_patient;
  var genericIncomeTool = Toolkit.tools.generic_income;
  var genericExpenseTool = Toolkit.tools.generic_expense;
  var cashTransferTool = Toolkit.tools.cash_transfer;

  // action on convention payment tool
  conventionPaymentTool.action = openVoucherTool(conventionPaymentTool);
  genericIncomeTool.action = openVoucherTool(genericIncomeTool);
  genericExpenseTool.action = openVoucherTool(genericExpenseTool);
  cashTransferTool.action = openVoucherTool(cashTransferTool);
  supportPatientTool.action = openVoucherTool(supportPatientTool);

  /**
   * @function openVoucherTool
   *
   * @description open the modal of the tool
   */
  function openVoucherTool(voucherTool) {
    return function () {
      return Toolkit.open(voucherTool).then(processVoucherToolRows);
    };
  }

  /**
   * @function processVoucherToolRows
   *
   * @description this function handle the result of the tool modal
   */
  function processVoucherToolRows(result) {
    if (!result) { return; }

    vm.Voucher.replaceFormRows(result.rows);

    // force updating details
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
    $timeout(function () {
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
    var gridData = JSON.parse(JSON.stringify(vm.gridOptions.data));
    gridData.forEach(function (item) {
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
    .then(function (currencies) {
      currencies.forEach(function (currency) {
        currency.label = Currencies.format(currency.id);
      });
      vm.currencies = currencies;
    })
    .catch(Notify.handleError);

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
      .then(function (document) {
        row.configure({ document: document });
      });
  }

  /** Get the selected currency symbol */
  function currencySymbol(currency_id) {
    if (!currency_id) { return; }
    return Currencies.symbol(currency_id);
  }

  /** run the module on startup and refresh */
  function startup() {
    vm.gridOptions.data = vm.Voucher.store.data;
  }

  /* ============================= Transaction Type ============================= */

  Vouchers.transactionType()
    .then(function (list) {
      vm.types = list.data.map(function (item) {
        item.hrText = $translate.instant(item.text);
        return item;
      });
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
      Notify.danger('VOUCHERS.COMPLEX.INVALID_VALUES');
      return;
    }

    var valid = vm.Voucher.validate();

    if (!valid) {
      Notify.danger(vm.Voucher._error);
      return;
    }

    var voucher = vm.Voucher.details;
    voucher.items = vm.Voucher.store.data;

    return Vouchers.create(voucher)
      .then(function (result) {
        Receipts.voucher(result.uuid, true);
        vm.Voucher.clear();
        form.$setPristine();
      })
      .catch(Notify.handleError);
  }

  startup();
}
