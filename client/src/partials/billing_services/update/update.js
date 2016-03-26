angular.module('bhima.controllers')
.controller('BillingServicesUpdateController', BillingServicesUpdateController);

BillingServicesUpdateController.$inject = [
  '$stateParams', 'BillingServicesService', 'AccountService'
];

/**
 * Updates a billing service passed in via a URL parameter.  For example,
 * billing_services/1 will update the billing service with id 1.
 *
 * Importantly, both this controller and the BillingServicesCreateController
 * use the same template, billing_services/form.html.
 */
function BillingServicesUpdateController($stateParams, BillingServices, Accounts) {
  var vm = this;

  // the form title is defined in the JS to allow us to reuse templates
  vm.title = 'BILLING_SERVICES.FORM.UPDATE';

  // the label will contain a copy of the billing service's label we are updating
  vm.label = '';

  // this is the CreateForm's model
  vm.model = {};

  // the submit method to POST data to the server
  vm.submit = submit;

  // fired on application startup
  function startup() {

    // load the billing service by id
    BillingServices.read($stateParams.id)
    .then(function (service) {

      // set the label to the label of the fetched service
      vm.label = service.label;

      // bind the fetched data to the form for editing
      vm.model = service;

      // load the accounts
      return Accounts.read();
    })
    .then(function (accounts) {

      // bind the accounts to the view
      vm.accounts = accounts;

      // loop through the accounts and select the correct account to display
      // in the typeahead
      vm.model.account = accounts.reduce(function (value, account) {

        // if the value is not false, we have found the account, so return it
        if (value) { return value; }

        // if the ids match, return the account, otherwise false
        return (account.id === vm.model.account_id) ? account : value;
      }, false);
    })
    .catch(function (response) {
      vm.error = response.data;
    });
  }

  /**
   * submits the form to the server.  If the form does not pass angular form
   * validation, the function will immediately exit.
   *
   * @param {Object} form - the BillingServicesForm object
   * @returns {Promise} promise - the $http promise from the BillingServiceService's
   *   update() method
   */
  function submit(form) {

    // remove any previously attached messages
    delete vm.error;
    delete vm.updated;

    // exit immediately if the form is not valid
    if (form.$invalid) {
      return;
   }

    // submit data to the server
    return BillingServices.update($stateParams.id, vm.model)
    .then(function () {
      vm.updated = true;

      // update the cached label
      vm.label = vm.model.label;
    })
    .catch(function (error) {
      vm.error = error;
    });
  }

  // load initial data from the server
  startup();
}
