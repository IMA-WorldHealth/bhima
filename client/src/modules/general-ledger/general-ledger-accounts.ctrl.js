angular.module('bhima.controllers')
  .controller('GeneralLedgerAccountsController', GeneralLedgerAccountsController);

GeneralLedgerAccountsController.$inject = [
  'GeneralLedgerService', 'SessionService', 'NotifyService',
  'uiGridConstants', 'ReceiptModal', 'ExportService', 'GridColumnService', 'AppCache', 'GridStateService', '$state', 'LanguageService'
];

/**
 * @module GeneralLedgerAccountsController
 *
 * @description
 * This controller is responsible for displaying accounts and their balances
 */
function GeneralLedgerAccountsController(GeneralLedger, Session, Notify,
  uiGridConstants, Receipts, Export, Columns, AppCache, GridState, $state, Languages) {
  var vm = this;
  var columns;
  var state;

  var cacheKey = 'GeneralLedgerAccounts';
  var cache = AppCache(cacheKey);  

  vm.enterprise = Session.enterprise;
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
  vm.loading = true;
  vm.slip = slip;
  vm.slipCsv = slipCsv;
  vm.toggleFilter = toggleFilter;

  vm.gridOptions = {
    columnDefs        : columns,
    fastWatch         : true,
    flatEntityAccess  : true,
    enableColumnMenus : false,
    appScopeProvider  : vm,
    onRegisterApi     : onRegisterApi,
  };

  function onRegisterApi(gridApi) {
    vm.gridApi = gridApi;
  }

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

  function slip(id) {
    Receipts.accountSlip(id);
  }

  function slipCsv(id) {
    var params = { renderer: 'csv' };
    var url = '/reports/finance/general_ledger/'.concat(id);
    Export.download(url, params, 'GENERAL_LEDGER.ACCOUNT_SLIP', 'export-'.concat(id));
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

  // display the printable report
  vm.openLedgerReport = function openLedgerReport() {
    var url = '/reports/finance/general_ledger';
    var params = formatExportParameters('pdf');

    if (!params) { return; }

    Export.download(url, params, 'GENERAL_LEDGER.TITLE', 'print');
  };

  // export data into csv file
  vm.exportFile = function exportFile() {
    var url = '/reports/finance/general_ledger';
    var params = formatExportParameters('csv');

    if (!params) { return; }

    Export.download(url, params, 'GENERAL_LEDGER.TITLE');
  };

  GeneralLedger.accounts.read()
    .then(loadData)
    .catch(handleError)
    .finally(toggleLoadingIndicator);
}
