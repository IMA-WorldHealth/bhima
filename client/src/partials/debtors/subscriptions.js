angular.module('bhima.controllers')
.controller('ChargeSubscriptions', ChargeSubscriptions);

ChargeSubscriptions.$inject = ['$uibModalInstance', 'DebtorGroup', 'BillingServicesService', 'DebtorGroupService'];

function ChargeSubscriptions(ModalInstance, DebtorGroup, BillingServices, DebtorGroups) {
  var vm = this;

  vm.close = ModalInstance.dismiss;
  vm.confirmSubscription = confirmSubscription;

  vm.group = DebtorGroup;
  vm.subscriptions = {};

  initialiseSubscriptions();

  vm.billingServices = [];

  console.log('vm.group', vm.group);

  BillingServices.read()
    .then(function (result) {
      console.log(result);

      vm.billingServices = result;
    });

  console.log(vm.group);

  function confirmSubscription(subscriptionForm) {

    if (subscriptionForm.$pristine) {
      ModalInstance.dismiss();
      return;
    }

    DebtorGroups.updateBillingServices(vm.group.uuid, vm.subscriptions)
      .then(function (results) {
        console.log('received');
        console.log(results);
      });
  }

  /**
   * @function initialiseSubscriptions
   *
   * @description
   * Iterate through debtor group billing services and pre-populate
   * the binary flags for current subscriptions
   */
  function initialiseSubscriptions() {
    vm.group.billingServices.forEach(function (billingService) {
      vm.subscriptions[billingService.billing_service_id] = true;
    });
  }

  console.log('charge subscriptions fired');
}
