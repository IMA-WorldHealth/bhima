angular.module('bhima.controllers')
  .controller('FiscalOpeningBalanceController', FiscalOpeningBalanceController);

FiscalOpeningBalanceController.$inject = [
  '$state', 'AccountService', 'AccountStoreService', 'FiscalService',
  'NotifyService', 'util', 'moment', 'uiGridConstants'
];

/**
 * This controller is responsible for handling the opening balance of the new fiscal year.
 */
function FiscalOpeningBalanceController($state, Accounts, AccountStore, Fiscal, Notify, util, moment, uiGridConstants) {
  var vm = this;

  var fiscalYearId = $state.params.id;

  // expose to the view
  vm.editBalanceEnabled  = false;
  vm.showAccountFilter   = false;
  vm.toggleEditBalance   = toggleEditBalance;
  vm.toggleAccountFilter = toggleAccountFilter;
  vm.submit = submit;

  // grid options
  vm.indentTitleSpace = 20;
  vm.gridApi = {};

  var columns = [
    { field : 'number', displayName : '', cellClass : 'text-right', width : 100},
    { field : 'label',
      displayName : 'FORM.LABELS.ACCOUNT',
      cellTemplate : '/modules/accounts/templates/grid.labelCell.tmpl.html',
      headerCellFilter : 'translate',
      enableFiltering: true,
      enableColumnMenu: false
    },
    { field : 'debit',
      displayName : 'FORM.LABELS.DEBIT',
      headerCellClass : 'text-center',
      headerCellFilter : 'translate',
      cellTemplate : '/modules/fiscal/templates/balance.debit.tmpl.html',
      width : 200,
      enableFiltering: false,
      enableColumnMenu: false
    },
    { field : 'credit',
      displayName : 'FORM.LABELS.CREDIT',
      headerCellClass : 'text-center',
      headerCellFilter : 'translate',
      cellTemplate : '/modules/fiscal/templates/balance.credit.tmpl.html',
      width : 200,
      enableFiltering: false,
      enableColumnMenu: false
    }
  ];

  vm.gridOptions = {
    appScopeProvider : vm,
    enableSorting : false,
    enableFiltering : vm.showAccountFilter,
    showTreeExpandNoChildren : false,
    enableColumnMenus : false,
    rowTemplate : '/modules/accounts/templates/grid.titleRow.tmpl.html',
    columnDefs : columns,
    onRegisterApi : onRegisterApi
  };

  // API register function
  function onRegisterApi(gridApi) {
    vm.gridApi = gridApi;
  }

  // get fiscal year
  Fiscal.read(fiscalYearId)
  .then(function (fy) {
    vm.fiscal = fy;
    return fy.previous_fiscal_year_id;
  })
  .then(hasPrevious)
  .catch(Notify.handleError);

  // get account
  Fiscal.periodicBalance({
    id: fiscalYearId,
    period_number: 0
  })
  .then(function (list) {
    vm.accounts = list;
    vm.gridOptions.data = Accounts.order(vm.accounts);
  })
  .catch(Notify.handleError);

  /**
   * @function submit
   */
  function submit(form) {
    vm.balanced = hasBalancedAccount();

    if (!vm.balanced && vm.hasPositive) {
      Notify.danger('ACCOUNT.NOT_BALANCED');
      return;
    } else if (!vm.balanced && !vm.hasPositive) {
      Notify.danger('ACCOUNT.NOT_POSITIVE');
      return;
    }

    // set the fiscal year opening balance
    Fiscal.setOpeningBalance({
      id: fiscalYearId,
      fiscal: vm.fiscal,
      accounts: vm.accounts
    })
    .then(function () {
      Notify.success(vm.previousFiscalYearExist ? 'FORM.INFO.IMPORT_SUCCESS' : 'FORM.INFO.SAVE_SUCCESS');
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

  /**
   * @function toggleEditBalance
   * @description edit the opening Balance
   */
  function toggleEditBalance() {
    vm.editBalanceEnabled = !vm.editBalanceEnabled;
  }

  /**
   * @function hasBalancedAccount
   * @description check if accounts are balanced
   */
  function hasBalancedAccount() {
    var cleanAccounts = vm.accounts.filter(function (item) {
      return (item.debit !== 0 || item.credit !== 0);
    });
    var debit = sumOf(cleanAccounts, 'debit');
    var credit = sumOf(cleanAccounts, 'credit');
    vm.hasPositive = (debit >= 0 && credit >= 0);
    return (debit === credit) && vm.hasPositive;
  }

  /**
   * @function hasPrevious
   * check if the previous fiscal year exists
   */
  function hasPrevious(previous_fiscal_year_id) {

    if (!previous_fiscal_year_id) { return false; }

    return Fiscal.read(previous_fiscal_year_id)
    .then(function (fy) {
      vm.previousFiscalYearExist = fy.id ? true : false;
    })
    .catch(Notify.handleError);
  }

  /**
   * @function sumOf
   * @description return the sum by a property
   * @param {array} array An array of objects
   * @param {string} property The property for the summation
   */
  function sumOf(array, property) {
    return array.reduce(function (a, b) {
      return a + b[property];
    }, 0);
  }

}
