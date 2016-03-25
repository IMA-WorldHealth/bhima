angular.module('bhima.controllers')
.controller('BillingServicesCreateController', BillingServicesCreateController);

BillingServicesCreateController.$inject = [
  '$state', 'BillingServicesService', 'AccountService'
];

function BillingServicesCreateController($state, BillingServices, Accounts) {
  var vm = this;

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
    delete vm.created;

    // exit immediately if the form is not valid
    if (form.$invalid) {
      return;
    }

    // submit data to the server
    return BillingServices.create(vm.model)
    .then(function () {

      // automatically reset the view
      vm.created = true;
      vm.model = {};

      // make sure the validation rules for the form are reset
      form.$setPristine();
    })
    .catch(function (error) {
      vm.error = error;
    });
  }

  // load initial data from the server
  startup();
}
