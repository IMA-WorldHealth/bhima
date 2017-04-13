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
      headerCellFilter : 'translate',
      width            : '10%' },

    { field            : 'label',
      displayName      : 'TABLE.COLUMNS.LABEL',
      cellTemplate     : '/modules/general-ledger/templates/account_label.cell.html',
      enableFiltering  : true,
      headerCellFilter : 'translate' },

    { field            : 'debtor_sold',
      displayName      : 'TABLE.COLUMNS.DEBTOR_SOLD',
      enableFiltering  : false,
      headerCellFilter : 'translate',
      headerCellClass  : 'text-center',
      cellTemplate     : '/modules/general-ledger/templates/debtor.cell.html',
      width            : '15%' },

    { field            : 'creditor_sold',
      displayName      : 'TABLE.COLUMNS.CREDITOR_SOLD',
      enableFiltering  : false,
      headerCellFilter : 'translate',
      headerCellClass  : 'text-center',
      cellTemplate     : '/modules/general-ledger/templates/creditor.cell.html',
      width            : '15%' },

    {
      field            : 'action',
      displayName      : '',
      cellTemplate     : '/modules/general-ledger/templates/action.cell.html',
      enableFiltering  : false,
      enableSorting    : false,
      enableColumnMenu : false,
      width            : '10%',
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
