angular.module('bhima.controllers')
  .controller('ComplexJournalVoucherController', ComplexJournalVoucherController);

ComplexJournalVoucherController.$inject = [
  'VoucherService', '$translate', 'CurrencyService', 'SessionService',
  'FindEntityService', 'FindReferenceService', 'NotifyService',
  'VoucherToolkitService', 'ReceiptModal', 'bhConstants', 'GridAggregatorService',
  'uiGridConstants', 'VoucherForm'
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
  vm.clear = function clear() {
    vm.Voucher.clear();
  };

  // fired on changes
  vm.onChanges = function onChanges() {
    vm.Voucher.onChanges();
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.EDIT);
  };

  // bread crumb paths
  vm.paths = [{
    label : $translate.instant('VOUCHERS.COMPLEX.TITLE'),
    current: true
  }];

  // breadcrumb dropdown
  vm.dropdown = [{
    label: 'VOUCHERS.GLOBAL.TOOLS',
    color: 'btn-default',
    icon: 'fa-cogs',
    option: Toolkit.options
  }];

  // ui-grid options
  vm.gridOptions = {
    appScopeProvider  : vm,
    //fastWatch         : true,
    flatEntityAccess : true,
    enableSorting     : false,
    enableColumnMenus : false,
    showColumnFooter  : true,
    onRegisterApi     : onRegisterApi
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

        vm.rows = result.rows;
        vm.rows.forEach(function (item) {
        });

        // vm.gridOptions.data = vm.rows;
        conventionPaymentDetails(result.convention);
      });
  }

  // set convention payment details
  function conventionPaymentDetails(convention) {
    vm.financialTransaction = true;

    var conventionType = vm.incomes.filter(function (item) {
      return item.id === 3;
    })[0];

    vm.voucher.type_id = JSON.stringify(conventionType);
    vm.voucher.description = convention.name;
    vm.defaultIncomeTypeId = 3;
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
      .then(function (reference) {
        row.reference = reference;
      });
  }

  /** Get the selected currency symbol */
  function currencySymbol(currency_id) {
    if (!currency_id) { return ; }
    return Currencies.symbol(currency_id);
  }


  /** summation */
  function summation() {
    // if the gridApi is available call the datachange function to recompute footer totals
    if (vm.gridApi) {
      vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.EDIT);
    }
  }

  /** run the module on startup and refresh */
  function startup() {
    vm.gridOptions.data = vm.Voucher.store.data;
  }

  /* ============================= Transaction Type ============================= */

  Vouchers.transactionType()
    .then(function (list) {
      groupType(list.data);
    })
    .catch(Notify.handleError);

  function groupType(array) {
    vm.incomes = array.filter(function (item) {
      return item.type === 'income';
    });
    vm.expenses = array.filter(function (item) {
      return item.type === 'expense';
    });
  }



  /* ============================= Grid ====================================== */

  // grid default options
  vm.gridOptions.columnDefs = [{
    field : 'isValid',
    displayName : '...',
    cellTemplate: 'partials/vouchers/templates/status.grid.tmpl.html',
    aggregationType: uiGridConstants.aggregationTypes.count,
    aggregationHideLabel : true,
    footerCellClass : 'text-center',
    width: 40
  }, {
    field : 'account',
    displayName : 'FORM.LABELS.ACCOUNT',
    headerCellFilter: 'translate',
    cellTemplate: 'partials/vouchers/templates/account.grid.tmpl.html',
    width: '35%'
  }, {
    field : 'debit',
    displayName : 'FORM.LABELS.DEBIT',
    headerCellFilter: 'translate',
    cellTemplate: 'partials/vouchers/templates/debit.grid.tmpl.html',
    aggregationType: uiGridConstants.aggregationTypes.sum,
    aggregationHideLabel : true,
    footerCellFilter: 'currency:' + Session.enterprise.currency_id,
    footerCellClass : 'text-right'
  }, {
    field : 'credit',
    displayName : 'FORM.LABELS.CREDIT',
    headerCellFilter: 'translate',
    cellTemplate: 'partials/vouchers/templates/credit.grid.tmpl.html',
    aggregationType: uiGridConstants.aggregationTypes.sum,
    aggregationHideLabel : true,
    footerCellFilter: 'currency:' + Session.enterprise.currency_id,
    footerCellClass : 'text-right'
  }, {
    field : 'entity',
    displayName : 'FORM.LABELS.DEBTOR_CREDITOR',
    headerCellFilter: 'translate',
    cellTemplate: 'partials/vouchers/templates/entity.grid.tmpl.html',
  }, {
    field : 'reference',
    displayName : 'FORM.LABELS.REFERENCE',
    headerCellFilter: 'translate',
    cellTemplate: 'partials/vouchers/templates/reference.grid.tmpl.html',
  }, {
    field : 'action', displayName : '...',
    width: 25,
    cellTemplate: 'partials/vouchers/templates/remove.grid.tmpl.html',
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
      })
      .catch(Notify.handleError);
  }

  startup();
}
