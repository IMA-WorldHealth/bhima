angular.module('bhima.controllers')
.controller('DebtorGroupCreateController', DebtorGroupCreateController);

DebtorGroupCreateController.$inject = [
    '$state', 'ScrollService', 'SessionService', 'DebtorGroupService', 'AccountService', 'PriceListService', 'uuid', 'NotifyService', '$translate'
];

/**
 * This controller is responsible for creating a debtor group. It provides
 * utility functions for submission and error handling.
 *
 * @todo refactor code to remove redundant features introduced previously
 *
 * @module debtor/groups/create
 */
function DebtorGroupCreateController($state, ScrollTo, SessionService, DebtorGroups, Accounts, Prices, Uuid, Notify, $translate) {
  var vm = this;

  // default new group policies
  var policies = {
    subsidies : true,
    discounts : true,
    billingServices : false
  };

  /* @todo This should be handled by the accounts directive - this controller should not be concerned with accounts */
  Accounts.read()
    .then(function (accounts) {
      vm.accounts = accounts;
    });

  /* @todo This controller should not be concerned about individual price lists */
  /* @tood All read/ list API methods should be uniform on the client */
  Prices.read()
    .then(function (priceLists) {
      vm.priceLists = priceLists;
    });

  // expose state for optional view elements
  vm.state = $state;

  settupDefaults();

  function settupDefaults() {
    vm.createSessionId = Uuid();

    /* object to collect all form model values */
    vm.group = {};
    vm.group.uuid = vm.createSessionId;

    // set default values
    vm.group.location_id = SessionService.enterprise.location_id;

    // assigning policy logic
    vm.group.apply_discounts = policies.subsidies;
    vm.group.apply_subsidies = policies.discounts;
    vm.group.apply_billing_services = !policies.billingServices;

    vm.group.max_credit = 0;
    vm.submit = submit;
  }

  function submit(groupForm) {
    var submitGroup;

    groupForm.$setSubmitted();

    // ensure all Angular form validation checks have passed
    if (groupForm.$invalid) {
      Notify.danger('FORM.ERRORS.RECORD_ERROR');
      return;
    }

    // in order to display account correctly the entire account is stored in the
    // ng-model, we should extract this
    submitGroup = angular.copy(vm.group);
    submitGroup.account_id = vm.group.account_id.id;

    DebtorGroups.create(submitGroup)
      .then(function (result) {

        /** @todo notify library can accept a key */
        Notify.success('DEBTOR_GRP.CREATED');

        // Debtor group created
        if (vm.resetOnCompletion) {

          // reset module state (model + form)
          settupDefaults();
          groupForm.$setUntouched();
          groupForm.$setPristine();

          // move view to the top - ready to create another entity
          // $state.reload();
          ScrollTo('anchor');
        } else {

          // navigate back to list view
          $state.go('debtorGroups.list', null, {reload : true});
        }
      })
      .catch(Notify.handleError);
  }
}
