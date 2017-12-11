angular.module('bhima.controllers')
.controller('InvoicingFeeSubscriptions', InvoicingFeeSubscriptions);

InvoicingFeeSubscriptions.$inject = ['$uibModalInstance', 'DebtorGroup', 'InvoicingFeesService', 'DebtorGroupService', 'NotifyService'];

function InvoicingFeeSubscriptions(ModalInstance, DebtorGroup, InvoicingFees, DebtorGroups, Notify) {
  var vm = this;

  vm.close = ModalInstance.dismiss;
  vm.confirmSubscription = confirmSubscription;

  vm.group = DebtorGroup;
  vm.entityKey = 'DEBTOR_GROUP.POLICIES.INVOICING_FEES.TITLE';
  vm.subscriptions = {};
  vm.invoicingFees = [];

  initialiseSubscriptions();

  InvoicingFees.read()
    .then(function (result) {
      vm.invoicingFees = result;
      vm.entities = vm.invoicingFees;
    });

  function confirmSubscription(subscriptionForm) {

    if (subscriptionForm.$pristine) {
      ModalInstance.dismiss();
      return;
    }

    DebtorGroups.updateInvoicingFees(vm.group.uuid, vm.subscriptions)
      .then(function (results) {
        ModalInstance.close(formatSelection());
      })
      .catch(Notify.handleError);
  }

  /**
   * @function formatSelection
   *
   * @description
   * This function formats the newly selected/ subscribed invoicing fees to
   * update the parent states view.
   */
  function formatSelection() {
    return vm.invoicingFees
      .filter(function (invoicingFee) {
        var selectedOption = vm.subscriptions[invoicingFee.id];

        if (selectedOption) {
          return invoicingFee;
        }
      })
      .map(function (invoicingFee) {
        // transform id to invoicing fee specifically; routes could be updated to use id
        invoicingFee.invoicing_fee_id = invoicingFee.id;
        return invoicingFee;
      });
  }

  /**
   * @function initialiseSubscriptions
   *
   * @description
   * Iterate through debtor group invoicing fees and pre-populate
   * the binary flags for current subscriptions
   */
  function initialiseSubscriptions() {
    vm.group.invoicingFees.forEach(function (invoicingFee) {
      vm.subscriptions[invoicingFee.invoicing_fee_id] = true;
    });
  }
}
