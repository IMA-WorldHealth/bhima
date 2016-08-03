angular.module('bhima.controllers')
.controller('DebtorGroupUpdateController', DebtorGroupsUpdateController);

DebtorGroupsUpdateController.$inject = ['$state', 'DebtorGroupService', 'AccountService', 'PriceListService', 'ScrollService', 'util', 'NotifyService', '$translate'];

function DebtorGroupsUpdateController($state, DebtorGroups, Accounts, Prices, ScrollTo, util, Notify, $translate) {
  var vm = this;
  var target = $state.params.uuid;

  vm.submit = submit;
  vm.state = $state;

  // reset name attribute to ensure no UI glitch
  $state.current.data.label = null;

  Prices.read()
    .then(function (priceLists) {
      vm.priceLists = priceLists;
    });

  Accounts.read()
    .then(function (accounts) {
      vm.accounts = accounts;
      return DebtorGroups.read(target);
    })
    .then(function (result) {
      vm.group = result;

      $state.current.data.label = vm.group.name;

      /** @todo work around for checkboxes (use value='' instead) */
      vm.group.apply_billing_services = Boolean(vm.group.apply_billing_services);
      vm.group.apply_subsidies = Boolean(vm.group.apply_subsidies);
      vm.group.apply_discounts = Boolean(vm.group.apply_discounts);

      /** @todo work around to correctly display the account - this should be re-factorered */
      vm.group.account_id = selectAccount(vm.accounts, vm.group.account_id);
    });

  function submit(debtorGroupForm) {
    var submitDebtorGroup;
    debtorGroupForm.$setSubmitted();

    // ensure we don't make HTTP requests if the form is invalid - exit early
    if (debtorGroupForm.$invalid) {
      Notify.danger('FORM.ERRORS.RECORD_ERROR');
      return;
    }

    // catch 'nothing has changed' and redirect to list page
    if (debtorGroupForm.$pristine) {
      Notify.warn('FORM.ERRORS.NO_CHANGE');
      $state.go('debtorGroups.list', null, {reload : true});
      return;
    }

    submitDebtorGroup = util.filterFormElements(debtorGroupForm, true);

    // temporary work-around for displaying an entire account in the typeahead
    if (submitDebtorGroup.account_id) {
      submitDebtorGroup.account_id = vm.group.account_id.id;
    }

    DebtorGroups.update(target, submitDebtorGroup)
      .then(function (result) {
        Notify.success('DEBTOR_GROUP.UPDATED');
        $state.go('debtorGroups.list', null, {reload : true});
      })
      .catch(Notify.handleError);
  }

  /**
   * @deprecated
   * This method returns an account from a flat list of accounts given an ID.
   * This is a temporary solution to the typeahead model value requiring the full
   * account object.
   *
   * @param {Array}   accounts  List of accounts to search
   * @param {Number}  id        ID to match on
   * @returns                   Account given ID if it exists, null if it does not
   */
  function selectAccount(accounts, id) {
    var accountResult;
    accounts.some(function (account) {

      if (account.id === id) {

        // found the target account - end array propegation
        accountResult = account;
        return true;
      }
      return false;
    });
    return accountResult;
  }
}
