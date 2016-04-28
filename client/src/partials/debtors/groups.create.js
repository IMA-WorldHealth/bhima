angular.module('bhima.controllers')
.controller('DebtorGroupCreateController', DebtorGroupCreateController);

DebtorGroupCreateController.$inject = [
    '$state', 'ScrollService', 'SessionService', 'DebtorGroupService', 'AccountService', 'PriceListService', 'uuid', '$uiViewScroll', 'NotifyService'
];

function DebtorGroupCreateController($state, ScrollTo, SessionService, DebtorGroups, Accounts, Prices, Uuid, $uiViewScroll, Notify) {
  var vm = this;

  // default new group policies
  var policies = {
    subsidies : true,
    discounts : true,
    billingServices : false
  };

  /* @todo This should be handled by the accounts directive - this controller should not be concerned with accounts */
  Accounts.list()
    .then(function (accounts) {
      vm.accounts = accounts;
    });

  /* @todo This controller should not be concerned about individual price lists */
  /* @tood All read/ list API methods should be uniform on the client */
  Prices.read()
    .then(function (priceLists) {
      vm.priceLists = priceLists;
      console.log('got price lists', priceLists);
    });

  vm.state = $state;
  settupDefaults();
  console.log(vm.state);

  function settupDefaults() {

    vm.createSessionId = Uuid();

    /* object to collect all form model values */
    vm.group = {};

    vm.group.uuid = vm.createSessionId;

    // set default values
    vm.group.location_id = SessionService.enterprise.location_id;

    vm.group.apply_discounts = policies.subsidies;
    vm.group.apply_subsidies = policies.discounts;
    vm.group.apply_billing_services = !policies.billingServices;

    vm.group.max_credit = 0;

    vm.submit = submit;
  }

  function submit(groupForm) {
    var submitGroup;

    groupForm.$setSubmitted();

        console.log(groupForm);
    // ensure all Angular form validation checks have passed
    if (groupForm.$invalid) {
      return;
    }

    // in order to display account correctly the entire account is stored in the
    // ng-model, we should extract this
    submitGroup = angular.copy(vm.group);
    submitGroup.account_id = vm.group.account_id.id;

    console.log('submitting price list', submitGroup.price_list_uuid);
    console.log('submitting price list', typeof(submitGroup.price_list_uuid));

    DebtorGroups.create(submitGroup)
      .then(function (result) {

        // vm.written = true;

        Notify.success('Debtor group recorded successfully');

        // Debtor group created
        if (vm.resetOnCompletion) {

          // reset module state (model + form)
          settupDefaults();
          groupForm.$setUntouched();
          groupForm.$setPristine();

          // move view to the top - ready to create another entity
          ScrollTo('anchor');
          // $state.reload();

        } else {

          // navigate back to list view
          $state.go('debtorGroups.list', null, {reload : true});
        }
      })
      .catch(handleRequestError);
  }

  function handleRequestError(error) {
    vm.exception = error;
    ScrollTo('groupException');
  }
}
