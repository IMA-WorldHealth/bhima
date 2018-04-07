angular.module('bhima.controllers')
  .controller('FiscalClosingBalanceController', FiscalClosingBalanceController);

FiscalClosingBalanceController.$inject = [
  '$state', 'AccountService', 'FiscalService', 'NotifyService', 'SessionService',
  'uiGridConstants', 'bhConstants',
];

/**
 * @function FiscalClosingBalanceController
 *
 * @description
 * This controller is responsible for handling the closing balance of a fiscal year.
 */
function FiscalClosingBalanceController(
  $state, Accounts, Fiscal, Notify, Session, uiGridConstants
  , bhConstants
) {

  const vm = this;
  const fiscalYearId = $state.params.id;
  vm.currency_id = Session.enterprise.currency_id;

  // expose to the view
  vm.showAccountFilter = false;
  vm.toggleAccountFilter = toggleAccountFilter;
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
    cellTemplate : '/modules/fiscal/templates/debit.tmpl.html',
    width : 200,
    enableFiltering : false,
  }, {
    field : 'credit',
    displayName : 'FORM.LABELS.CREDIT',
    headerCellClass : 'text-center',
    headerCellFilter : 'translate',
    cellTemplate : '/modules/fiscal/templates/credit.tmpl.html',
    width : 200,
    enableFiltering : false,
  }];

  vm.gridOptions = {
    appScopeProvider : vm,
    fastWatch : true,
    flatEntityAccess : true,
    enableSorting : false,
    showColumnFooter : true,
    enableColumnMenus : false,
    enableFiltering : vm.showAccountFilter,
    columnDefs : columns,
    onRegisterApi,
  };

  // API register function
  function onRegisterApi(gridApi) {
    vm.gridApi = gridApi;
  }

  // get fiscal year
  Fiscal.read(fiscalYearId)
    .then((fy) => {
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
      .then((list) => {
        list.forEach(account => {
          account.isTitleAccount = account.type_id === bhConstants.accounts.TITLE;
        });

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
