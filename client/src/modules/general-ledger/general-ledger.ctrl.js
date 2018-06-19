angular.module('bhima.controllers')
  .controller('GeneralLedgerController', GeneralLedgerController);

GeneralLedgerController.$inject = [
  'GeneralLedgerService', 'SessionService', 'NotifyService', 'uiGridConstants',
  'ReceiptModal', 'GridColumnService', 'GridStateService', '$state',
  'LanguageService', 'ModalService', 'FiscalService', 'bhConstants',
  'AccountService',
];

/**
 * @module GeneralLedgerController
 *
 * @description
 * This controller is responsible for displaying accounts and their balances
 */
function GeneralLedgerController(
  GeneralLedger, Session, Notify, uiGridConstants, Receipts, Columns,
  GridState, $state, Languages, Modal, Fiscal, bhConstants, Accounts
) {
  const vm = this;
  const cacheKey = 'GeneralLedger';

  const fields = [
    'balance',
    'balance0',
    'balance1',
    'balance2',
    'balance3',
    'balance4',
    'balance5',
    'balance6',
    'balance7',
    'balance8',
    'balance9',
    'balance10',
    'balance11',
    'balance12',
  ];

  vm.filterEnabled = false;
  vm.openColumnConfiguration = openColumnConfiguration;
  vm.onSelectFiscalYear = onSelectFiscalYear;
  vm.Constants = bhConstants;
  vm.aggregates = {};

  vm.indentTitleSpace = 15;

  const tmpl = `
    <div class="ui-grid-cell-contents">
      <span style="padding-left : {{row.entity.$$treeLevel * grid.appScope.indentTitleSpace}}px;"></span>
      {{grid.getCellValue(row, col)}}
    </span>`;


  function customAggregationFn(columnDefs, column) {
    return (vm.aggregates[column.field] || 0).toFixed(2);
  }

  const columns = [{
    field            : 'number',
    displayName      : 'TABLE.COLUMNS.ACCOUNT',
    enableFiltering  : true,
    headerCellFilter : 'translate',
    width : 80,
    cellClass        : 'text-right',
  }, {
    field            : 'label',
    displayName      : 'TABLE.COLUMNS.LABEL',
    enableFiltering  : true,
    headerCellFilter : 'translate',
    cellTemplate : tmpl,
  }, {
    field            : 'balance',
    type : 'number',
    displayName      : 'TABLE.COLUMNS.BALANCE',
    enableFiltering  : false,
    headerCellFilter : 'translate',
    headerCellClass  : 'text-center',
    cellFilter       : 'currency:'.concat(Session.enterprise.currency_id),
    cellClass        : 'text-right',
    footerCellClass  : 'text-right',
    footerCellFilter : 'currency:'.concat(Session.enterprise.currency_id),
    aggregationType : customAggregationFn,
    aggregationHideLabel : true,
  }, {
    field            : 'balance0',
    type : 'number',
    displayName      : 'FORM.LABELS.OPENING_BALANCE',
    enableFiltering  : false,
    headerCellFilter : 'translate',
    headerCellClass  : 'text-center',
    cellFilter       : 'currency:'.concat(Session.enterprise.currency_id),
    cellClass        : 'text-right',
    footerCellClass  : 'text-right',
    footerCellFilter : 'currency:'.concat(Session.enterprise.currency_id),
    aggregationType : customAggregationFn,
    aggregationHideLabel : true,
  }, {
    field            : 'balance1',
    type : 'number',
    displayName      : 'TABLE.COLUMNS.DATE_MONTH.JANUARY',
    enableFiltering  : false,
    headerCellFilter : 'translate',
    headerCellClass  : 'text-center',
    cellFilter       : 'currency:'.concat(Session.enterprise.currency_id),
    cellClass        : 'text-right',
    footerCellClass  : 'text-right',
    footerCellFilter : 'currency:'.concat(Session.enterprise.currency_id),
    aggregationType : customAggregationFn,
    aggregationHideLabel : true,
  }, {
    field            : 'balance2',
    type : 'number',
    displayName      : 'TABLE.COLUMNS.DATE_MONTH.FEBRUARY',
    enableFiltering  : false,
    headerCellFilter : 'translate',
    headerCellClass  : 'text-center',
    cellFilter       : 'currency:'.concat(Session.enterprise.currency_id),
    cellClass        : 'text-right',
    footerCellClass  : 'text-right',
    footerCellFilter : 'currency:'.concat(Session.enterprise.currency_id),
    aggregationType : customAggregationFn,
    aggregationHideLabel : true,
  }, {
    field            : 'balance3',
    type : 'number',
    displayName      : 'TABLE.COLUMNS.DATE_MONTH.MARCH',
    enableFiltering  : false,
    headerCellFilter : 'translate',
    headerCellClass  : 'text-center',
    cellFilter       : 'currency:'.concat(Session.enterprise.currency_id),
    cellClass        : 'text-right',
    footerCellClass  : 'text-right',
    footerCellFilter : 'currency:'.concat(Session.enterprise.currency_id),
    aggregationType : customAggregationFn,
    aggregationHideLabel : true,
  }, {
    field            : 'balance4',
    type : 'number',
    displayName      : 'TABLE.COLUMNS.DATE_MONTH.APRIL',
    enableFiltering  : false,
    headerCellFilter : 'translate',
    headerCellClass  : 'text-center',
    cellFilter       : 'currency:'.concat(Session.enterprise.currency_id),
    cellClass        : 'text-right',
    footerCellClass  : 'text-right',
    footerCellFilter : 'currency:'.concat(Session.enterprise.currency_id),
    aggregationType : customAggregationFn,
    aggregationHideLabel : true,
  }, {
    field            : 'balance5',
    type : 'number',
    displayName      : 'TABLE.COLUMNS.DATE_MONTH.MAY',
    enableFiltering  : false,
    headerCellFilter : 'translate',
    headerCellClass  : 'text-center',
    cellFilter       : 'currency:'.concat(Session.enterprise.currency_id),
    cellClass        : 'text-right',
    footerCellClass  : 'text-right',
    footerCellFilter : 'currency:'.concat(Session.enterprise.currency_id),
    aggregationType : customAggregationFn,
    aggregationHideLabel : true,
  }, {
    field            : 'balance6',
    type : 'number',
    displayName      : 'TABLE.COLUMNS.DATE_MONTH.JUNE',
    enableFiltering  : false,
    headerCellFilter : 'translate',
    headerCellClass  : 'text-center',
    cellFilter       : 'currency:'.concat(Session.enterprise.currency_id),
    cellClass        : 'text-right',
    footerCellClass  : 'text-right',
    footerCellFilter : 'currency:'.concat(Session.enterprise.currency_id),
    aggregationType : customAggregationFn,
    aggregationHideLabel : true,
  }, {
    field            : 'balance7',
    type : 'number',
    displayName      : 'TABLE.COLUMNS.DATE_MONTH.JULY',
    enableFiltering  : false,
    headerCellFilter : 'translate',
    headerCellClass  : 'text-center',
    cellFilter       : 'currency:'.concat(Session.enterprise.currency_id),
    cellClass        : 'text-right',
    footerCellClass  : 'text-right',
    footerCellFilter : 'currency:'.concat(Session.enterprise.currency_id),
    aggregationType : customAggregationFn,
    aggregationHideLabel : true,
  }, {
    field            : 'balance8',
    type : 'number',
    displayName      : 'TABLE.COLUMNS.DATE_MONTH.AUGUST',
    enableFiltering  : false,
    headerCellFilter : 'translate',
    headerCellClass  : 'text-center',
    cellFilter       : 'currency:'.concat(Session.enterprise.currency_id),
    cellClass        : 'text-right',
    footerCellClass  : 'text-right',
    footerCellFilter : 'currency:'.concat(Session.enterprise.currency_id),
    aggregationType : customAggregationFn,
    aggregationHideLabel : true,
  }, {
    field            : 'balance9',
    type : 'number',
    displayName      : 'TABLE.COLUMNS.DATE_MONTH.SEPTEMBER',
    enableFiltering  : false,
    headerCellFilter : 'translate',
    headerCellClass  : 'text-center',
    cellFilter       : 'currency:'.concat(Session.enterprise.currency_id),
    cellClass        : 'text-right',
    footerCellClass  : 'text-right',
    footerCellFilter : 'currency:'.concat(Session.enterprise.currency_id),
    aggregationType : customAggregationFn,
    aggregationHideLabel : true,
  }, {
    field            : 'balance10',
    type : 'number',
    displayName      : 'TABLE.COLUMNS.DATE_MONTH.OCTOBER',
    enableFiltering  : false,
    headerCellFilter : 'translate',
    headerCellClass  : 'text-center',
    cellFilter       : 'currency:'.concat(Session.enterprise.currency_id),
    cellClass        : 'text-right',
    footerCellClass  : 'text-right',
    footerCellFilter : 'currency:'.concat(Session.enterprise.currency_id),
    aggregationType : customAggregationFn,
    aggregationHideLabel : true,
  }, {
    field            : 'balance11',
    type : 'number',
    displayName      : 'TABLE.COLUMNS.DATE_MONTH.NOVEMBER',
    enableFiltering  : false,
    headerCellFilter : 'translate',
    headerCellClass  : 'text-center',
    cellFilter       : 'currency:'.concat(Session.enterprise.currency_id),
    cellClass        : 'text-right',
    footerCellClass  : 'text-right',
    footerCellFilter : 'currency:'.concat(Session.enterprise.currency_id),
    aggregationType : customAggregationFn,
    aggregationHideLabel : true,
  }, {
    field            : 'balance12',
    type : 'number',
    displayName      : 'TABLE.COLUMNS.DATE_MONTH.DECEMBER',
    enableFiltering  : false,
    headerCellFilter : 'translate',
    headerCellClass  : 'text-center',
    cellFilter       : 'currency:'.concat(Session.enterprise.currency_id),
    cellClass        : 'text-right',
    footerCellClass  : 'text-right',
    footerCellFilter : 'currency:'.concat(Session.enterprise.currency_id),
    aggregationType : customAggregationFn,
    aggregationHideLabel : true,
  }, {
    field            : 'action',
    displayName      : '',
    cellTemplate     : '/modules/general-ledger/templates/action.cell.html',
    enableFiltering  : false,
    enableSorting    : false,
    enableColumnMenu : false,
  }];

  vm.gridApi = {};
  vm.toggleFilter = toggleFilter;

  vm.gridOptions = {
    columnDefs : columns,
    fastWatch : true,
    flatEntityAccess  : true,
    enableColumnMenus : false,
    showTreeExpandNoChildren : false,
    rowTemplate : '/modules/accounts/templates/grid.leafRow.tmpl.html',
    gridFooterTemplate : '/modules/general-ledger/grid.footer.html',
    showGridFooter : true,
    showColumnFooter : true,
    appScopeProvider  : vm,
    onRegisterApi : onRegisterApiFn,
  };

  const columnConfig = new Columns(vm.gridOptions, cacheKey);
  const state = new GridState(vm.gridOptions, cacheKey);

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
  function onRegisterApiFn(api) {
    vm.gridApi = api;
    api.grid.registerDataChangeCallback(expandOnSetData);
  }

  function expandOnSetData(grid) {
    if (grid.options.data.length > 0) {
      grid.api.treeBase.expandAllRows();
    }
  }

  function openColumnConfiguration() {
    columnConfig.openConfigurationModal();
  }

  function toggleFilter() {
    vm.filterEnabled = !vm.filterEnabled;
    vm.gridOptions.enableFiltering = vm.filterEnabled;
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
  }

  function preProcessAccounts(account) {
    account.hrlabel = Accounts.label(account);

    // remove zero values from the matrix to render as empty cells.
    fields.forEach((field) => {
      if (account[field] === 0) {
        delete account[field];
        return;
      }

      // total all values that are not title account values
      if (account.type_id !== bhConstants.accounts.TITLE) {
        vm.aggregates[field] += account[field];
      }
    });
  }

  function loadData(accounts = []) {
    // make an object of aggregates { column:0 }
    vm.aggregates = fields.reduce((aggregates, field) => {
      aggregates[field] = 0;
      return aggregates;
    }, {});

    Object.keys(vm.aggregates).forEach(key => {
      vm.aggregates[key] = Number(vm.aggregates[key].toFixed(bhConstants.precision.MAX_DECIMAL_PRECISION));
    });

    accounts.forEach(preProcessAccounts);
    Accounts.order(accounts);

    vm.gridOptions.data = accounts;
  }

  vm.download = GeneralLedger.download;
  vm.openAccountReport = function openAccountReport(accountId) {
    const opts = {
      account_id : accountId,
      dateFrom : vm.year.start_date,
      dateTo : vm.year.end_date,
      limit : 1000,
      renderer : 'pdf',
    };

    return GeneralLedger.openAccountReport(opts);
  };

  // loads data for the general Ledger
  function load(options) {
    vm.loading = true;

    GeneralLedger.accounts.read(null, options)
      .then(loadData)
      .catch(handleError)
      .finally(toggleLoadingIndicator);
  }

  // fired when the footer changes and on startup.
  function onSelectFiscalYear(year) {
    vm.year = year;
    vm.fiscalYearLabel = vm.year.label;

    vm.filters = {
      fiscal_year_id : vm.year.id,
      fiscal_year_label : vm.year.label,
    };

    load(vm.filters);
  }

  // runs on startup
  function startup() {
    // TODO(@jniles) - cache this date
    Fiscal.read(null, { detailed : 1 })
      .then((years) => {
        vm.fiscalYears = years;

        // get the last year
        onSelectFiscalYear(years[0]);
      })
      .catch(Notify.handleError);
  }

  startup();
}
