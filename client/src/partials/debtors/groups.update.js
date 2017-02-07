/**
 * @todo complex page should require loading resolve before displaying, a lot of
 *       data is fetched per page load
 */
angular.module('bhima.controllers')
.controller('DebtorGroupUpdateController', DebtorGroupsUpdateController);

DebtorGroupsUpdateController.$inject = [
  '$state', 'DebtorGroupService', 'AccountService', 'PriceListService', 'ScrollService', 'util', 'NotifyService'
];

function DebtorGroupsUpdateController($state, DebtorGroups, Accounts, Prices, ScrollTo, util, Notify) {
  var vm = this;
  var target = $state.params.uuid;

  vm.submit = submit;
  vm.state = $state;
  vm.billingServiceSubscriptions = billingServiceSubscriptions;
  vm.subsidySubscriptions = subsidySubscriptions;

  vm.$loading = true;
  vm.$loaded = false;

  // reset name attribute to ensure no UI glitch
  $state.current.data.label = null;

  Prices.read()
    .then(function (priceLists) {
      vm.priceLists = priceLists;
      return Accounts.read();
    })
    .then(function (accounts) {
      vm.accounts = accounts;
      return DebtorGroups.read(target);
    })
    .then(function (result) {
      vm.group = result;
      vm.$loaded = true;
      $state.current.data.label = vm.group.name;

      /** @todo work around for checkboxes (use value='' instead) */
      vm.group.apply_billing_services = Boolean(vm.group.apply_billing_services);
      vm.group.apply_subsidies = Boolean(vm.group.apply_subsidies);
      vm.group.apply_discounts = Boolean(vm.group.apply_discounts);
    })
    .catch(Notify.handleError)
    .finally(function () {
      vm.$loading = false;
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

    DebtorGroups.update(target, submitDebtorGroup)
      .then(function (result) {
        Notify.success('DEBTOR_GROUP.UPDATED');
        $state.go('debtorGroups.list', null, {reload : true});
      })
      .catch(Notify.handleError);
  }

  function billingServiceSubscriptions() {
    var modal = DebtorGroups.manageBillingServices(vm.group);
    modal.result
      .then(function (results) {
        // update UI
        vm.group.billingServices = results;
        Notify.success('FORM.INFO.UPDATE_SUCCESS');
      });
  }

  function subsidySubscriptions() {
    var modal = DebtorGroups.manageSubsidies(vm.group);
    modal.result
      .then(function (results) {
        // update UI
        vm.group.subsidies = results;
        Notify.success('FORM.INFO.UPDATE_SUCCESS');
      });
  }
}
