angular.module('bhima.controllers')
  .controller('GeneralLedgerAccountsController', GeneralLedgerAccountsController);

GeneralLedgerAccountsController.$inject = [
  'GeneralLedgerService', 'SessionService', 'NotifyService', 'uiGridConstants',
  'ReceiptModal', 'ExportService', 'GridColumnService', 'GridStateService',
  '$state', 'LanguageService', 'ModalService', 'FiscalService', 'bhConstants',
];

/**
 * @module GeneralLedgerAccountsController
 *
 * @description
 * This controller is responsible for displaying accounts and their balances
 */
function GeneralLedgerAccountsController(
  GeneralLedger, Session, Notify, uiGridConstants, Receipts, Export, Columns,
  GridState, $state, Languages, Modal, Fiscal, bhConstants
) {
  var vm = this;
  var columns;
  var state;
  var cacheKey = 'GeneralLedgerAccounts';

  vm.today = new Date();
  vm.filterEnabled = false;
  vm.openColumnConfiguration = openColumnConfiguration;
  vm.onSelectFiscalYear = onSelectFiscalYear;

  function computeAccountCellStyle(grid, row) {
    return row.entity.isTitleAccount ? 'text-bold' : '';
  }

  columns = [
    { field            : 'number',
      displayName      : 'TABLE.COLUMNS.ACCOUNT',
      enableFiltering  : true,
      cellClass        : computeAccountCellStyle,
      headerCellFilter : 'translate' },

    { field            : 'label',
      displayName      : 'TABLE.COLUMNS.LABEL',
      enableFiltering  : true,
      cellClass        : computeAccountCellStyle,
      headerCellFilter : 'translate' },

    { field            : 'balance',
      displayName      : 'TABLE.COLUMNS.BALANCE',
      enableFiltering  : false,
      headerCellFilter : 'translate',
      headerCellClass  : 'text-center',
      cellClass        : computeAccountCellStyle,
      cellFilter       : 'currency:'.concat(Session.enterprise.currency_id) },

    { field            : 'balance0',
      displayName      : 'FORM.LABELS.OPENING_BALANCE',
      enableFiltering  : false,
      headerCellFilter : 'translate',
      headerCellClass  : 'text-center',
      cellClass        : computeAccountCellStyle,
      cellTemplate     : getCellTemplate('balance0') },

    { field            : 'balance1',
      displayName      : 'TABLE.COLUMNS.DATE_MONTH.JANUARY',
      enableFiltering  : false,
      headerCellFilter : 'translate',
      headerCellClass  : 'text-center',
      cellClass        : computeAccountCellStyle,
       cellTemplate    : getCellTemplate('balance1') },

    { field            : 'balance2',
      displayName      : 'TABLE.COLUMNS.DATE_MONTH.FEBRUARY',
      enableFiltering  : false,
      headerCellFilter : 'translate',
      headerCellClass  : 'text-center',
      cellClass        : computeAccountCellStyle,
      cellTemplate     : getCellTemplate('balance2') },

    { field            : 'balance3',
      displayName      : 'TABLE.COLUMNS.DATE_MONTH.MARCH',
      enableFiltering  : false,
      headerCellFilter : 'translate',
      headerCellClass  : 'text-center',
      cellClass        : computeAccountCellStyle,
      cellTemplate     : getCellTemplate('balance3') },

    { field            : 'balance4',
      displayName      : 'TABLE.COLUMNS.DATE_MONTH.APRIL',
      enableFiltering  : false,
      headerCellFilter : 'translate',
      headerCellClass  : 'text-center',
      cellClass        : computeAccountCellStyle,
      cellTemplate     : getCellTemplate('balance4') },

    { field            : 'balance5',
      displayName      : 'TABLE.COLUMNS.DATE_MONTH.MAY',
      enableFiltering  : false,
      headerCellFilter : 'translate',
      headerCellClass  : 'text-center',
      cellClass        : computeAccountCellStyle,
      cellTemplate     : getCellTemplate('balance5') },

    { field            : 'balance6',
      displayName      : 'TABLE.COLUMNS.DATE_MONTH.JUNE',
      enableFiltering  : false,
      headerCellFilter : 'translate',
      headerCellClass  : 'text-center',
      cellClass        : computeAccountCellStyle,
      cellTemplate     : getCellTemplate('balance6') },

    { field            : 'balance7',
      displayName      : 'TABLE.COLUMNS.DATE_MONTH.JULY',
      enableFiltering  : false,
      headerCellFilter : 'translate',
      headerCellClass  : 'text-center',
      cellClass        : computeAccountCellStyle,
      cellTemplate     : getCellTemplate('balance7') },

    { field            : 'balance8',
      displayName      : 'TABLE.COLUMNS.DATE_MONTH.AUGUST',
      enableFiltering  : false,
      headerCellFilter : 'translate',
      headerCellClass  : 'text-center',
      cellClass        : computeAccountCellStyle,
      cellTemplate     : getCellTemplate('balance8') },

    { field            : 'balance9',
      displayName      : 'TABLE.COLUMNS.DATE_MONTH.SEPTEMBER',
      enableFiltering  : false,
      headerCellFilter : 'translate',
      headerCellClass  : 'text-center',
      cellClass        : computeAccountCellStyle,
      cellTemplate     : getCellTemplate('balance9') },

    { field            : 'balance10',
      displayName      : 'TABLE.COLUMNS.DATE_MONTH.OCTOBER',
      enableFiltering  : false,
      headerCellFilter : 'translate',
      headerCellClass  : 'text-center',
      cellClass        : computeAccountCellStyle,
      cellTemplate     : getCellTemplate('balance10') },

    { field            : 'balance11',
      displayName      : 'TABLE.COLUMNS.DATE_MONTH.NOVEMBER',
      enableFiltering  : false,
      headerCellFilter : 'translate',
      headerCellClass  : 'text-center',
      cellClass        : computeAccountCellStyle,
      cellTemplate     : getCellTemplate('balance11') },


    { field            : 'balance12',
      displayName      : 'TABLE.COLUMNS.DATE_MONTH.DECEMBER',
      enableFiltering  : false,
      headerCellFilter : 'translate',
      headerCellClass  : 'text-center',
      cellClass        : computeAccountCellStyle,
      cellTemplate     : getCellTemplate('balance12') },

    {
      field            : 'action',
      displayName      : '',
      cellTemplate     : '/modules/general-ledger/templates/action.cell.html',
      enableFiltering  : false,
      enableSorting    : false,
      enableColumnMenu : false,
    },
  ];

  vm.gridApi = {};
  vm.toggleFilter = toggleFilter;

  vm.gridOptions = {
    columnDefs        : columns,
    fastWatch         : true,
    flatEntityAccess  : true,
    enableColumnMenus : false,
    appScopeProvider  : vm,
    gridFooterTemplate : '/modules/general-ledger/grid.footer.html',
    showGridFooter     : true,
    onRegisterApi     : onRegisterApi,
  };

  var columnConfig = new Columns(vm.gridOptions, cacheKey);
  state = new GridState(vm.gridOptions, cacheKey);

  vm.saveGridState = state.saveGridState;
  vm.clearGridState = function clearGridState() {
    state.clearGridState();
    $state.reload();
  };

  function handleError(err) {
    vm.hasError = true;
    Notify.handleError(err);
  }

  function toggleLoadingIndicator() {
    vm.loading = !vm.loading;
  }

  // API register function
  function onRegisterApi(gridApi) {
    vm.gridApi = gridApi;
  }

  function openColumnConfiguration() {
    columnConfig.openConfigurationModal();
  }

  function toggleFilter() {
    vm.filterEnabled = !vm.filterEnabled;
    vm.gridOptions.enableFiltering = vm.filterEnabled;
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
  }

  function labelTitleAccounts(account) {
    account.isTitleAccount = account.type_id === bhConstants.accounts.TITLE;
  }

  function loadData(accounts) {
    // make sure the title accounts are identified
    accounts.forEach(labelTitleAccounts);

    // TODO - finish this
    GeneralLedger.computeAccountBalances(accounts);

    vm.gridOptions.data = accounts;
  }

  function getCellTemplate(key) {
    return '<div class="ui-grid-cell-contents text-right">' +
      '<div ng-show="row.entity.' + key + '" >' +
        '{{ row.entity.' + key + ' | currency:' + Session.enterprise.currency_id + ' }}' +
      '</div>' +
    '</div>';
  }

  vm.download = GeneralLedger.download;
  vm.slip = GeneralLedger.slip;

  // loads data for the general Ledger
  function load(options) {
    vm.loading = true;

    GeneralLedger.accounts.read(null, options)
      .then(loadData)
      .catch(handleError)
      .finally(toggleLoadingIndicator);
  }

  function onSelectFiscalYear(year) {
    vm.year = year;
    vm.fiscalYearLabel = vm.year.label;

    vm.filters = {
      fiscal_year_id : vm.year.id,
      fiscal_year_label : vm.year.label,
    };

    vm.filtersSlip = {
      dateFrom : vm.year.start_date,
      dateTo : vm.year.end_date,
      limit : 1000,
    };

    load(vm.filters);
  }

  // runs on startup
  function startup() {
    // TODO(@jniles) - cache this date
    Fiscal.read(null, { detailed : 1 })
      .then(function (years) {
        vm.fiscalYears = years;

        // get the last year
        onSelectFiscalYear(years[0]);
      })
      .catch(Notify.handleError);
  }

  startup();
}
