angular.module('bhima.controllers')
.controller('BillingServicesDeleteController', BillingServicesDeleteController);

BillingServicesDeleteController.$inject = [
  '$state', '$uibModalInstance', 'BillingServicesService'
];

/**
 * Billing Services Delete Controller
 *
 * This is a super simple controller to ensure that errors are properly handled
 * and translated on the billing services modal.  It leverages the shared
 * ConfirmModal template.
 *
 * This controller is instantiated in a modal.
 */
function BillingServicesDeleteController($state, Instance, BillingServices) {
  var vm = this;

  // bind methods to the view
  vm.dismiss = Instance.dismiss;
  vm.submit = submit;
  vm.prompt = 'FORM.DIALOGS.CONFIRM_DELETE';

  // submit a delete request to the server
  function submit() {
    // clear the error, if it exists
    delete vm.error;

    // attempt to delete the billing service
    return BillingServices.delete($state.params.id)
      .then(function () {
        // if successful, close the modal instance
        Instance.close();
      })
      .catch(Instance.dismiss);
  }
}
