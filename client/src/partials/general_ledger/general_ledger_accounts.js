angular.module('bhima.controllers')
  .controller('GeneralLedgerAccountsController', GeneralLedgerAccountsController);

GeneralLedgerAccountsController.$inject = [
  'GeneralLedgerService', 'SessionService', 'NotifyService', 
  'uiGridConstants', 'ReceiptModal',
];

/**
 * @module GeneralLedgerAccountsController
 *
 * @description
 * This controller is responsible for displaying accounts and their solds
 */
function GeneralLedgerAccountsController(GeneralLedger, Session, Notify, uiGridConstants, Receipts) {
  var vm = this;

  vm.enterprise = Session.enterprise;
  vm.filterEnabled = false;

  var columns = [
    { field            : 'number',
      displayName      : 'TABLE.COLUMNS.ACCOUNT',
      enableFiltering  : true,
      headerCellFilter : 'translate',
      enableCellEdit   : false,
      width            : '10%' },

    { field            : 'label',
      displayName      : 'TABLE.COLUMNS.LABEL',
      enableFiltering  : true,
      headerCellFilter : 'translate',
      enableCellEdit   : false },

    { field            : 'debtor_sold',
      displayName      : 'TABLE.COLUMNS.DEBTOR_SOLD',
      enableFiltering  : false,
      headerCellFilter : 'translate',
      headerCellClass  : 'text-center',
      cellClass        : 'text-right',
      cellFilter       : 'currency: grid.appScope.enterprise.currency_id',
      cellTemplate     : '/partials/general_ledger/templates/debtor.cell.html',
      enableCellEdit   : false,
      width            : '15%' },

    { field            : 'creditor_sold',
      displayName      : 'TABLE.COLUMNS.CREDITOR_SOLD',
      enableFiltering  : false,
      headerCellFilter : 'translate',
      headerCellClass  : 'text-center',
      cellClass        : 'text-right',
      cellFilter       : 'currency: grid.appScope.enterprise.currency_id',
      cellTemplate     : '/partials/general_ledger/templates/creditor.cell.html',
      enableCellEdit   : false,
      width            : '15%' },

    {
      field            : 'action',
      displayName      : '',
      cellTemplate     : '/partials/general_ledger/templates/action.cell.html',
      enableFiltering  : false,
      enableSorting    : false,
      enableColumnMenu : false,
      width            : '10%',
    },
  ];

  vm.gridApi = {};
  vm.loading = true;
  vm.slip = slip;
  vm.toggleFilter = toggleFilter;

  vm.gridOptions = {
    columnDefs        : columns,
    fastWatch         : true,
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

  GeneralLedger.accounts.read()
    .then(loadData)
    .catch(handleError)
    .finally(toggleLoadingIndicator);

}
