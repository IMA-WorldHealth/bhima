angular.module('bhima.controllers')
  .controller('GeneralLedgerAccountsController', GeneralLedgerAccountsController);

GeneralLedgerAccountsController.$inject = [
  'GeneralLedgerService', 'SessionService', 'NotifyService',
  'uiGridConstants', 'ReceiptModal', 'ExportService', 'GridColumnService', 'AppCache', 'GridStateService', 
  '$state', 'LanguageService', 'ModalService', 'FiscalService',
];

/**
 * @module GeneralLedgerAccountsController
 *
 * @description
 * This controller is responsible for displaying accounts and their balances
 */
function GeneralLedgerAccountsController(GeneralLedger, Session, Notify,
  uiGridConstants, Receipts, Export, Columns, AppCache, GridState, $state, Languages, Modal, Fiscal) {
  var vm = this;
  var columns;
  var state;
  var cacheKey = 'GeneralLedgerAccounts';
  var cache = AppCache(cacheKey);  

  vm.enterprise = Session.enterprise;
  vm.today = new Date();
  vm.filterEnabled = false;
  vm.openColumnConfiguration = openColumnConfiguration;

  columns = [
    { field            : 'number',
      displayName      : 'TABLE.COLUMNS.ACCOUNT',
      enableFiltering  : true,
      cellTemplate     : '/modules/general-ledger/templates/account_number.cell.html',
      headerCellFilter : 'translate' },

    { field            : 'label',
      displayName      : 'TABLE.COLUMNS.LABEL',
      cellTemplate     : '/modules/general-ledger/templates/account_label.cell.html',
      enableFiltering  : true,
      headerCellFilter : 'translate' },

    { field            : 'balance',
      displayName      : 'TABLE.COLUMNS.BALANCE',
      enableFiltering  : false,
      headerCellFilter : 'translate',
      headerCellClass  : 'text-center',
      cellTemplate     : '/modules/general-ledger/templates/balance.cell.html' },

    { field            : 'balance1',
      displayName      : 'TABLE.COLUMNS.DATE_MONTH.JANUARY',
      enableFiltering  : false,
      headerCellFilter : 'translate',
      headerCellClass  : 'text-center',
       cellTemplate    : getCellTemplate('balance1')},

    { field            : 'balance2',
      displayName      : 'TABLE.COLUMNS.DATE_MONTH.FEBRUARY',
      enableFiltering  : false,
      headerCellFilter : 'translate',
      headerCellClass  : 'text-center',
      cellTemplate     : getCellTemplate('balance2') },

    { field            : 'balance3',
      displayName      : 'TABLE.COLUMNS.DATE_MONTH.MARCH',
      enableFiltering  : false,
      headerCellFilter : 'translate',
      headerCellClass  : 'text-center',
      cellTemplate     : getCellTemplate('balance3') },

    { field            : 'balance4',
      displayName      : 'TABLE.COLUMNS.DATE_MONTH.APRIL',
      enableFiltering  : false,
      headerCellFilter : 'translate',
      headerCellClass  : 'text-center',
      cellTemplate     : getCellTemplate('balance4') },

    { field            : 'balance5',
      displayName      : 'TABLE.COLUMNS.DATE_MONTH.MAY',
      enableFiltering  : false,
      headerCellFilter : 'translate',
      headerCellClass  : 'text-center',
      cellTemplate     : getCellTemplate('balance5') },

    { field            : 'balance6',
      displayName      : 'TABLE.COLUMNS.DATE_MONTH.JUNE',
      enableFiltering  : false,
      headerCellFilter : 'translate',
      headerCellClass  : 'text-center',
      cellTemplate     : getCellTemplate('balance6') },

    { field            : 'balance7',
      displayName      : 'TABLE.COLUMNS.DATE_MONTH.JULY',
      enableFiltering  : false,
      headerCellFilter : 'translate',
      headerCellClass  : 'text-center',
      cellTemplate     : getCellTemplate('balance7') },

    { field            : 'balance8',
      displayName      : 'TABLE.COLUMNS.DATE_MONTH.AUGUST',
      enableFiltering  : false,
      headerCellFilter : 'translate',
      headerCellClass  : 'text-center',
      cellTemplate     : getCellTemplate('balance8') },

    { field            : 'balance9',
      displayName      : 'TABLE.COLUMNS.DATE_MONTH.SEPTEMBER',
      enableFiltering  : false,
      headerCellFilter : 'translate',
      headerCellClass  : 'text-center',
      cellTemplate     : getCellTemplate('balance9') },

    { field            : 'balance10',
      displayName      : 'TABLE.COLUMNS.DATE_MONTH.OCTOBER',
      enableFiltering  : false,
      headerCellFilter : 'translate',
      headerCellClass  : 'text-center',
      cellTemplate     : getCellTemplate('balance10') },

    { field            : 'balance11',
      displayName      : 'TABLE.COLUMNS.DATE_MONTH.NOVEMBER',
      enableFiltering  : false,
      headerCellFilter : 'translate',
      headerCellClass  : 'text-center',
      cellTemplate     : getCellTemplate('balance11') },


    { field            : 'balance12',
      displayName      : 'TABLE.COLUMNS.DATE_MONTH.DECEMBER',
      enableFiltering  : false,
      headerCellFilter : 'translate',
      headerCellClass  : 'text-center',
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
  };

  var columnConfig = new Columns(vm.gridOptions, cacheKey);
  state = new GridState(vm.gridOptions, cacheKey);

  vm.saveGridState = state.saveGridState;
  vm.clearGridState = function clearGridState() {
    state.clearGridState();
    $state.reload();
  }  

  function handleError(err) {
    vm.hasError = true;
    Notify.handleError(err);
  }

  function toggleLoadingIndicator() {
    vm.loading = !vm.loading;
  }

  function openColumnConfiguration() {
    columnConfig.openConfigurationModal();
  }

  function toggleFilter() {
    vm.filterEnabled = !vm.filterEnabled;
    vm.gridOptions.enableFiltering = vm.filterEnabled;
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
  }

  function loadData(data) {
    vm.gridOptions.data = data;
  }

  function getCellTemplate(key) {
    return '<div class="ui-grid-cell-contents text-right">' +
      '<div ng-show="row.entity.' + key +'" >' +
        '{{ row.entity.' + key +' | currency: grid.appScope.enterprise.currency_id }}' +
      '</div>' + 
    '</div>';
  }

  // format Export Parameters
  function formatExportParameters(type) {
    return { renderer: type || 'pdf', lang: Languages.key };
  }

  vm.download = GeneralLedger.download;
  vm.slip = GeneralLedger.slip;

  // open search modal
  vm.openFiscalYearConfiguration = function openFiscalYearConfiguration() {
    Modal.openSelectFiscalYear()
      .then(function (filters) {
        if (!filters) { return; }
          vm.fiscalYearLabel = filters.fiscal_year.label;
          vm.filters.fiscal_year_label = filters.fiscal_year.label;

          vm.filters = {
            fiscal_year_id : filters.fiscal_year.id, 
            fiscal_year_label : filters.fiscal_year.label
          };
          
          vm.filtersSlip = {
            dateFrom : filters.fiscal_year.start_date, 
            dateTo : filters.fiscal_year.end_date
          };

          load(vm.filters);
      })
      .catch(Notify.handleError);

  };  

  // loads data for the general Ledger
  function load(options) {
    vm.loading = true;

    GeneralLedger.accounts.read(null, options)
      .then(loadData)
      .catch(handleError)
      .finally(toggleLoadingIndicator);
  }

  // runs on startup
  function startup() {
    Fiscal.fiscalYearDate({ date : vm.today })
    .then(function (year) {
      vm.year = year[0];
      vm.fiscalYearLabel = vm.year.label;
      vm.year.fiscal_year_id;
      vm.filters = {fiscal_year_id : vm.year.fiscal_year_id, fiscal_year_label : vm.year.label};
      vm.filtersSlip = {dateFrom : vm.year.start_date, dateTo : vm.year.end_date};

      load(vm.filters);
    })
    .catch(Notify.handleError);
  }

  startup();

}
