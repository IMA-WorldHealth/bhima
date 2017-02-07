angular.module('bhima.controllers')
.controller('BillingServicesCreateController', BillingServicesCreateController);

BillingServicesCreateController.$inject = [
  'BillingServicesService', 'AccountService', '$uibModalInstance', 'util'
];

/**
 * Billing Services Create Controller
 *
 * This controller allows the user to create a new billing service using a form.
 * Note that this uses the same HTML form as the update controller
 */
function BillingServicesCreateController(BillingServices, Accounts, ModalInstance, util) {
  var vm = this;

  // the form title is defined in the JS to allow us to reuse templates
  vm.title = 'BILLING_SERVICES.FORM.CREATE';

  // this is the CreateForm's model
  vm.model = {};

  // bind the submit method to POST data to the server
  vm.submit = submit;
  vm.dismiss = ModalInstance.dismiss;

  vm.length200 = util.length200;
  vm.maxLength = util.maxTextLength;

  // fired on application startup
  function startup() {
    Accounts.read()
    .then(function (accounts) {
      vm.accounts = accounts;
    });
  }

  /**
   * submits the form to the server.  If the form does not pass angular form
   * validation, the function will immediately exit.
   *
   * @param {Object} form - the CreateForm object
   * @returns {Promise} promise - the $http promise from the BillingServiceService's
   *   create() method
   */
  function submit(form) {

    // remove any previously attached messages
    delete vm.error;

    // exit immediately if the form is not valid
    if (form.$invalid) {
      return;
    }

    // submit data to the server
    return BillingServices.create(vm.model)
    .then(function (data) {
      ModalInstance.close(data.id);
    })
    .catch(function (response) {
      vm.error = response.data;
    });
  }

  // load initial data from the server
  startup();
}
