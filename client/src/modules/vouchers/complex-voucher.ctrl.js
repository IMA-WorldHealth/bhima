angular.module('bhima.controllers')
  .controller('ComplexJournalVoucherController', ComplexJournalVoucherController);

ComplexJournalVoucherController.$inject = [
  'VoucherService', '$translate', 'CurrencyService', 'SessionService',
  'FindEntityService', 'FindReferenceService', 'NotifyService',
  'VoucherToolkitService', 'ReceiptModal', 'bhConstants', 'GridAggregatorService',
  'uiGridConstants', 'VoucherForm',
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
function ComplexJournalVoucherController(Vouchers, $translate, Currencies, Session, FindEntity, FindReference, Notify, Toolkit, Receipts, bhConstants, GridAggregators, uiGridConstants, VoucherForm) {
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

  // action on convention payment tool
  conventionPaymentTool.action = openConventionPaymentTool;

  // open convention payment function
  function openConventionPaymentTool() {
    Toolkit.open(conventionPaymentTool)
      .then(function (result) {
        if (!result) { return; }

        var rows = result.rows;
        var n = result.rows.length;

        while (n--) {
          vm.Voucher.addItems(1);

          var lastRowIdx = vm.Voucher.store.data.length - 1;
          var lastRow = vm.Voucher.store.data[lastRowIdx];

          lastRow.configure(rows[n]);
        }

        vm.Voucher.validate();
        vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.ROW);
      });
  }

  /** ======================== end voucher tools ======================= */

  // bind the startup method as a reset method
  vm.submit = submit;
  vm.currencySymbol     = currencySymbol;
  vm.openEntityModal    = openEntityModal;
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
