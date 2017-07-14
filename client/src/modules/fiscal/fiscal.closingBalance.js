angular.module('bhima.controllers')
  .controller('FiscalClosingBalanceController', FiscalClosingBalanceController);

FiscalClosingBalanceController.$inject = [
  '$state', 'AccountService', 'AccountStoreService', 'FiscalService',
  'NotifyService', 'util', 'moment', 'uiGridConstants',
];

/**
 * This controller is responsible for handling the closing balance of a fiscal year.
 */
function FiscalClosingBalanceController($state, Accounts, AccountStore, Fiscal, Notify, util, moment, uiGridConstants) {
  var vm = this;
  var columns;
  var fiscalYearId = $state.params.id;

  // expose to the view
  vm.showAccountFilter = false;
  vm.toggleAccountFilter = toggleAccountFilter;

  // grid options
  vm.indentTitleSpace = 20;
  vm.gridApi = {};

  columns = [
    { field : 'number', displayName : '', cellClass : 'text-right', width : 100 },
    { field : 'label',
      displayName : 'FORM.LABELS.ACCOUNT',
      cellTemplate : '/modules/accounts/templates/grid.labelCell.tmpl.html',
      headerCellFilter : 'translate',
      enableFiltering : true,
    },
    { field : 'debit',
      displayName : 'FORM.LABELS.DEBIT',
      headerCellClass : 'text-center',
      headerCellFilter : 'translate',
      cellTemplate : '/modules/fiscal/templates/balance.debit.tmpl.html',
      width : 200,
      enableFiltering : false,
    },
    { field : 'credit',
      displayName : 'FORM.LABELS.CREDIT',
      headerCellClass : 'text-center',
      headerCellFilter : 'translate',
      cellTemplate : '/modules/fiscal/templates/balance.credit.tmpl.html',
      width : 200,
      enableFiltering : false,
    },
  ];

  vm.gridOptions = {
    appScopeProvider : vm,
    fastWatch : true,
    flatEntityAccess : true,
    enableSorting : false,
    enableFiltering : vm.showAccountFilter,
    enableColumnMenus : false,
    rowTemplate : '/modules/accounts/templates/grid.titleRow.tmpl.html',
    columnDefs : columns,
    onRegisterApi : onRegisterApi,
  };

  // API register function
  function onRegisterApi(gridApi) {
    vm.gridApi = gridApi;
  }

  // get fiscal year
  Fiscal.read(fiscalYearId)
  .then(function (fy) {
    vm.fiscal = fy;
    $state.params.label = vm.fiscal.label;
    return fy.previous_fiscal_year_id;
  })
  .then(loadPeriodicBalance)
  .catch(Notify.handleError);

  /**
   * loadPeriodicBalance
   * load the balance until a given period
   */
  function loadPeriodicBalance() {
    Fiscal.periodicBalance({
      id : fiscalYearId,
      period_number : vm.fiscal.number_of_months + 1,
    })
    .then(function (list) {
      vm.accounts = list;
      vm.gridOptions.data = Accounts.order(vm.accounts);
    })
    .catch(Notify.handleError);
  }

  /**
   * @function toggleAccountFilter
   * @description show a filter for finding an account
   */
  function toggleAccountFilter() {
    vm.showAccountFilter = !vm.showAccountFilter;
    vm.gridOptions.enableFiltering = vm.showAccountFilter;
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.ALL);
  }
}
