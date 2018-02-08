angular.module('bhima.controllers')
  .controller('FiscalOpeningBalanceController', FiscalOpeningBalanceController);

FiscalOpeningBalanceController.$inject = [
  '$state', 'AccountService', 'FiscalService', 'NotifyService',
  'uiGridConstants', 'SessionService', 'bhConstants',
];

/**
 * This controller is responsible for handling the opening balance of the new fiscal year.
 */
function FiscalOpeningBalanceController($state, Accounts, Fiscal, Notify, uiGridConstants, Session, bhConstants) {
  const vm = this;
  const fiscalYearId = $state.params.id;

  // expose to the view
  vm.enterprise = Session.enterprise;
  vm.editBalanceEnabled = false;
  vm.showAccountFilter = false;
  vm.toggleEditBalance = toggleEditBalance;
  vm.toggleAccountFilter = toggleAccountFilter;
  vm.submit = submit;

  // grid options
  vm.indentTitleSpace = 20;
  vm.gridApi = {};

  const columns = [{
    field : 'number',
    displayName : '',
    cellClass : 'text-right',
    width : 100,
  }, {
    field : 'label',
    displayName : 'FORM.LABELS.ACCOUNT',
    cellTemplate : '/modules/accounts/templates/grid.labelCell.tmpl.html',
    headerCellFilter : 'translate',
    enableFiltering : true,
  }, {
    field : 'debit',
    displayName : 'FORM.LABELS.DEBIT',
    headerCellClass : 'text-center',
    headerCellFilter : 'translate',
    cellTemplate : '/modules/fiscal/templates/balance.debit.tmpl.html',
    width : 200,
    enableFiltering : false,
  }, {
    field : 'credit',
    displayName : 'FORM.LABELS.CREDIT',
    headerCellClass : 'text-center',
    headerCellFilter : 'translate',
    cellTemplate : '/modules/fiscal/templates/balance.credit.tmpl.html',
    width : 200,
    enableFiltering : false,
  }];

  vm.gridOptions = {
    appScopeProvider : vm,
    fastWatch : true,
    flatEntityAccess : true,
    enableSorting : false,
    enableColumnMenus : false,
    enableFiltering : vm.showAccountFilter,
    columnDefs : columns,
    onRegisterApi,
  };

  startup();

  // API register function
  function onRegisterApi(gridApi) {
    vm.gridApi = gridApi;
  }

  // load fiscal year and periodic balance
  function startup() {
    Fiscal.read(fiscalYearId)
      .then(fy => {
        vm.fiscal = fy;
        $state.params.label = vm.fiscal.label;
        return fy.previous_fiscal_year_id;
      })
      .then(hasPrevious)
      .then(loadPeriodicBalance)
      .catch(Notify.handleError);
  }

  // load periodic balance
  function loadPeriodicBalance() {
    return Fiscal.periodicBalance({
      id : fiscalYearId,
      period_number : 0,
    })
      .then(list => {
        vm.accounts = list;
        vm.balanced = hasBalancedAccount();

        vm.accounts.forEach(account => {
          account.isTitleAccount = account.type_id === bhConstants.accounts.TITLE;
        });

        vm.gridOptions.data = Accounts.order(vm.accounts);
      });
  }

  /**
   * @function submit
   * @description set the opening balance of the fiscal year
   */
  function submit() {
    vm.balanced = hasBalancedAccount();

    if (!vm.previousFiscalYearExist && !vm.balanced) {
      Notify.danger('ACCOUNT.NOT_BALANCED');
      return;
    }

    // set the fiscal year opening balance
    Fiscal.setOpeningBalance({
      id : fiscalYearId,
      fiscal : vm.fiscal,
      accounts : vm.accounts,
    })
      .then(() => {
        Notify.success(vm.previousFiscalYearExist ? 'FORM.INFO.IMPORT_SUCCESS' : 'FORM.INFO.SAVE_SUCCESS');
        startup();
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
    const cleanAccounts = vm.accounts.filter(item => {
      return (item.debit !== 0 || item.credit !== 0);
    });
    vm.totalDebit = sumOf(cleanAccounts, 'debit').toFixed(2);
    vm.totalCredit = sumOf(cleanAccounts, 'credit').toFixed(2);
    return vm.totalDebit === vm.totalCredit;
  }

  /**
   * @function hasPrevious
   * check if the previous fiscal year exists
   */
  function hasPrevious(previousFiscalYearId) {
    if (!previousFiscalYearId) { return false; }
    return Fiscal.read(previousFiscalYearId)
      .then(fiscalYear => {
        vm.previousFiscalYearExist = !!fiscalYear.id;
      });
  }

  /**
   * @function sumOf
   * @description return the sum by a property
   * @param {array} array An array of objects
   * @param {string} property The property for the summation
   */
  function sumOf(array, property) {
    return array.reduce((a, b) => a + b[property], 0);
  }
}
