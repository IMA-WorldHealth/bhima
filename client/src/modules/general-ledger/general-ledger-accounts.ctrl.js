angular.module('bhima.controllers')
  .controller('GeneralLedgerAccountsController', GeneralLedgerAccountsController);

GeneralLedgerAccountsController.$inject = [
  'GeneralLedgerService', 'SessionService', 'NotifyService',
  'uiGridConstants', 'ReceiptModal', 'ExportService',
];

/**
 * @module GeneralLedgerAccountsController
 *
 * @description
 * This controller is responsible for displaying accounts and their balances
 */
function GeneralLedgerAccountsController(GeneralLedger, Session, Notify,
  uiGridConstants, Receipts, Export) {
  var vm = this;
  var columns;

  vm.enterprise = Session.enterprise;
  vm.filterEnabled = false;

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
      cellTemplate     : '/modules/general-ledger/templates/balance1.cell.html' },

    { field            : 'balance2',
      displayName      : 'TABLE.COLUMNS.DATE_MONTH.FEBRUARY',
      enableFiltering  : false,
      headerCellFilter : 'translate',
      headerCellClass  : 'text-center',
      cellTemplate     : '/modules/general-ledger/templates/balance2.cell.html' },

    { field            : 'balance3',
      displayName      : 'TABLE.COLUMNS.DATE_MONTH.MARCH',
      enableFiltering  : false,
      headerCellFilter : 'translate',
      headerCellClass  : 'text-center',
      cellTemplate     : '/modules/general-ledger/templates/balance3.cell.html' },

    { field            : 'balance4',
      displayName      : 'TABLE.COLUMNS.DATE_MONTH.APRIL',
      enableFiltering  : false,
      headerCellFilter : 'translate',
      headerCellClass  : 'text-center',
      cellTemplate     : '/modules/general-ledger/templates/balance4.cell.html' },

    { field            : 'balance5',
      displayName      : 'TABLE.COLUMNS.DATE_MONTH.MAY',
      enableFiltering  : false,
      headerCellFilter : 'translate',
      headerCellClass  : 'text-center',
      cellTemplate     : '/modules/general-ledger/templates/balance5.cell.html' },

    { field            : 'balance6',
      displayName      : 'TABLE.COLUMNS.DATE_MONTH.JUNE',
      enableFiltering  : false,
      headerCellFilter : 'translate',
      headerCellClass  : 'text-center',
      cellTemplate     : '/modules/general-ledger/templates/balance6.cell.html' },

    { field            : 'balance7',
      displayName      : 'TABLE.COLUMNS.DATE_MONTH.JULY',
      enableFiltering  : false,
      headerCellFilter : 'translate',
      headerCellClass  : 'text-center',
      cellTemplate     : '/modules/general-ledger/templates/balance7.cell.html' },

    { field            : 'balance8',
      displayName      : 'TABLE.COLUMNS.DATE_MONTH.AUGUST',
      enableFiltering  : false,
      headerCellFilter : 'translate',
      headerCellClass  : 'text-center',
      cellTemplate     : '/modules/general-ledger/templates/balance8.cell.html' },

    { field            : 'balance9',
      displayName      : 'TABLE.COLUMNS.DATE_MONTH.SEPTEMBER',
      enableFiltering  : false,
      headerCellFilter : 'translate',
      headerCellClass  : 'text-center',
      cellTemplate     : '/modules/general-ledger/templates/balance9.cell.html' },

    { field            : 'balance10',
      displayName      : 'TABLE.COLUMNS.DATE_MONTH.OCTOBER',
      enableFiltering  : false,
      headerCellFilter : 'translate',
      headerCellClass  : 'text-center',
      cellTemplate     : '/modules/general-ledger/templates/balance10.cell.html' },

    { field            : 'balance11',
      displayName      : 'TABLE.COLUMNS.DATE_MONTH.NOVEMBER',
      enableFiltering  : false,
      headerCellFilter : 'translate',
      headerCellClass  : 'text-center',
      cellTemplate     : '/modules/general-ledger/templates/balance11.cell.html' },


    { field            : 'balance12',
      displayName      : 'TABLE.COLUMNS.DATE_MONTH.DECEMBER',
      enableFiltering  : false,
      headerCellFilter : 'translate',
      headerCellClass  : 'text-center',
      cellTemplate     : '/modules/general-ledger/templates/balance12.cell.html' },                                                      

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
    onRegisterApi     : onRegisterApiFn,
  };

  function onRegisterApiFn(gridApi) {
    vm.gridApi = gridApi;
  }

  function handleError(err) {
    vm.hasError = true;
    Notify.handleError(err);
  }

  function toggleLoadingIndicator() {
    vm.loading = !vm.loading;
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


  GeneralLedger.accounts.read()
    .then(loadData)
    .catch(handleError)
    .finally(toggleLoadingIndicator);
}
