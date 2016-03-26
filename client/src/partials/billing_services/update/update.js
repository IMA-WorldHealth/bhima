angular.module('bhima.controllers')
.controller('BillingServicesUpdateController', BillingServicesUpdateController);

BillingServicesUpdateController.$inject = [
  '$state', '$stateParams', 'BillingServicesService', 'AccountService'
];

function BillingServicesUpdateController($state, $stateParams, BillingServices, Accounts) {
  var vm = this;

  // The form title is defined in the JS to allow us to reuse templates
  vm.title = 'BILLING_SERVICES.FORM.UPDATE';

  // this is the CreateForm's model
  vm.model = {};

  // the submit method to POST data to the server
  vm.submit = submit;

  // fired on application startup
  function startup() {
    Accounts.read()
    .then(function (accounts) {
      vm.accounts = accounts;
    });

    // load the billing service by id
    BillingServices.read($stateParams.id)
    .then(function (service) {
      vm.model = service;

      return Accounts.read(service.account_id);
    })
    .then(function (account) {
      vm.model.account = account;
    })
    .catch(function (error) {
      vm.error = error;
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
    delete vm.created;

    // exit immediately if the form is not valid
    if (form.$invalid) {
      return;
   }

    // submit data to the server
    return BillingServices.update($stateParams.id, vm.model)
    .then(function () {
      vm.updated = true;
    })
    .catch(function (error) {
      vm.error = error;
    });
  }

  // load initial data from the server
  startup();
}
