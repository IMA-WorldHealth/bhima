angular.module('bhima.controllers')
  .controller('FiscalOpeningBalanceController', FiscalOpeningBalanceController);

FiscalOpeningBalanceController.$inject = [
  '$state', 'AccountStoreService', 'FiscalService', 'NotifyService', 'util', 'moment'
];

/**
 * This controller is responsible for handling the opening balance of the new fiscal year.
 */
function FiscalOpeningBalanceController($state, AccountStore, Fiscal, Notify, util, moment) {
  var vm = this;

  var fiscalYearId = $state.params.id;

  // expose to the view
  vm.editBalanceEnabled  = false;
  vm.showAccountFilter   = false;
  vm.toggleEditBalance   = toggleEditBalance;
  vm.toggleAccountFilter = toggleAccountFilter;
  vm.submit = submit;

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
  })
  .catch(Notify.handleError);

  /**
   * @function submit
   */
  function submit(form) {
    vm.balanced = hasBalancedAccount();

    if (!vm.balanced) { return ; }

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
