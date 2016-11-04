angular.module('bhima.controllers')
.controller('ChargeSubscriptions', ChargeSubscriptions);

ChargeSubscriptions.$inject = ['$uibModalInstance', 'DebtorGroup', 'BillingServicesService', 'DebtorGroupService', 'NotifyService'];

function ChargeSubscriptions(ModalInstance, DebtorGroup, BillingServices, DebtorGroups, Notify) {
  var vm = this;

  vm.close = ModalInstance.dismiss;
  vm.confirmSubscription = confirmSubscription;

  vm.group = DebtorGroup;

  vm.subscriptions = {};

  initialiseSubscriptions();

  vm.billingServices = [];

  BillingServices.read()
    .then(function (result) {
      vm.billingServices = result;
    });

  function confirmSubscription(subscriptionForm) {

    if (subscriptionForm.$pristine) {
      ModalInstance.dismiss();
      return;
    }

    DebtorGroups.updateBillingServices(vm.group.uuid, vm.subscriptions)
      .then(function (results) {
        ModalInstance.close(formatSelection());
      })
      .catch(Notify.handleError);
  }

  /**
   * @function formatSelection
   *
   * @description
   * This function formats the newly selected/ subscribed billing services to
   * update the parent states view.
   */
  function formatSelection() {
    return vm.billingServices
      .filter(function (billingService) {
        var selectedOption = vm.subscriptions[billingService.id];

        if (selectedOption) {
          return billingService;
        }
      })
      .map(function (billingService) {
        // transform id to billing service specifically; routes could be updated to use id
        billingService.billing_service_id = billingService.id;
        return billingService;
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
}
